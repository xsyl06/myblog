---
title: 06-Innodb原理与Mysql日志机制
order: 6
date: 2024-04-16
category:
  - Mysql
tag:
  - Mysql
---

## Mysql 内部结构

总体来说，mysql 服务端分为 Service 层和引擎层，其中 Service 层包括连接器、查询缓存、词法分析器、优化器、执行器等功能；引擎层主要包括各种执行引擎，如 Innodb、Myisam 等主要从磁盘读写数据的引擎。

​![image](/assets/img/image-20240403095317-r88px0b.png)​

### Service 层

主要包括连接器、连接器、查询缓存、词法分析器、优化器、执行器等，同时内置函数(如时间、日期、数学和加密函数等)，所有跨存储引擎的功能都在这一层实现，比如存储过程、触发器、视图等。

#### 连接器

当 mysql 的客户端发起链接请求时，就由连接器进行处理，它提供链接建立、权限认证、维持并管理链接等功能。当链接一个 mysql 数据库的时候，一般会用以下命令链接

```shell
[root@192 ~]# mysql -h host[数据库地址] -u root[用户] -p root[密码] -P 3306
```

链接命令中使用的时 mysql 提供的客户端，-h 参数是链接数据库的 ip 地址，-P 参数是链接数据库的端口。客户端在与 mysql 服务端完成 TCP 握手后，使用用户和密码进行验证，服务端会出现以下情况

1. 用户名或密码错误，服务端验证不通过，会返回"Access denied for user"，客户端会结束程序执行。
2. 用户名和密码正确，服务端查询用户权限表，查询当前登录用户所拥有的表及服务器权限，然后缓存起来，之后该链接的所有权限会从缓存中获取。因此，当管理员修改了用户权限后，已经建立过链接的也不会受到影响，只有再次建立连接，修改后的权限才会生效。

#### 查询缓存

连接建立完成后，就可以执行 sql 了，这就进入了 service 层的第二步：查询缓存。

当 mysql 拿到一个查询 sql 时，会先查询缓存中是否存在相同的 sql，也就是之前执行过相同的 sql，如果有，就会从缓存中获取数据进行返回。之前执行的 sql 的结果会以 key-value 方式存储在内存中，key 是执行的 sql，value 为 sql 的结果。如果缓存中没有对应的结果，那么就会继续执行后续的阶段，当从硬盘中查询出结果后，将结果存储在缓存中。

从执行步骤可以看出，如果能从缓存中获取到查询结果，可以省略后续查询硬盘等步骤，查询效率会非常高。

> 但一般而言，**查询缓存比较鸡肋**，因为只要更新过表中的值，那么缓存中对应的表的缓存全部会失效，在一般的业务场景下，缓存失效的非常快。因此很可能查询刚建立缓存，然后就被更新失效掉了，对于更新频繁的系统来说，缓存的命中会非常低。

因此，一般建议大家在静态表中使用缓存，比如不常修改的字典表，系统表等。mysql 也提供按需使用。可以将 my.cnf 参数 `query_cache_type` ​设置成 DEMAND

```text
my.cnf
#query_cache_type有3个值 0代表关闭查询缓存OFF，1代表开启ON，2（DEMAND）代表当sql语句中有SQL_CACHE关键词时才缓存
query_cache_type=2
```

这样，对于一般的 sql 语句不开启查询缓存，当有需要时，可显式的指定查询缓存

```sql
select SQL_CACHE * from test where id=1;
```

查看当前 mysql 实例是否开启缓存

```sql
show global variables like "%query_cache_type&";
```

> mysql8.0 移除了查询缓存功能

#### 词法分析器

当没有命中缓存或设置了按需开启且查询 sql 中没有关键字时，就需要真正执行 sql 了，这时 mysql 需要知道你想要怎么做，就需要分析传过来的 sql，对 sql 进行词法、语法分析。

分析器会先做"**词法分析**"。mysql 会先做词法分析，分析你发送过来的 sql 是什么，比如识别 select，那就知道是需要进行查询，将 from 后的单词识别为表名，将 where 后面的字符串识别为列名等等。

做完了这些识别后，还需要进行语法识别。mysql 会根据语法规则分析传入的语句是否满足 mysql 的语法。比如下面这句因为将 from 关键字写错，就收到"You have an error in your SQL syntax"的报错。

```sql
select * fro user_info;
```

分析器对 sql 分析的过程

​![image](/assets/img/image-20240403153733-sngoc8g.png)​

当分析器分析过后，会生成这样一个语法树

​![image](/assets/img/image-20240403153801-wbkehas.png)​

至此，词法分析器将语句分析完成，将进入优化器

#### 优化器

经过了分析器，MySQL 就知道你要做什么了。在开始执行之前，还要先经过优化器的处理。

优化器是在表里面有多个索引的时候，决定使用哪个索引；或者在一个语句有多表关联（join）的时候，决定各个表的连接顺序；以及一些 mysql 自己内部的优化机制。

#### 执行器

开始执行的时候，要先判断一下你对这个表 T 有没有执行查询的权限，如果没有，就会返回没有权限的错误，如下所示 (在工程实现上，如果命中查询缓存，会在查询缓存返回结果的时候，做权限验证)。

```sql
select * from test where id=10;
```

如果有权限，就打开表继续执行。打开表的时候，执行器就会根据表的引擎定义，去使用这个引擎提供的接口。

### 引擎层

引擎层负责数据的存储和提取其架构模式是插件式的，支持 InnoDB、MyISAM、Memory 等多个存储引擎。现在最常用的存储引擎是 InnoDB，它从 MySQL 5.5.5 版本开始成为了默认存储引擎。也就是说如果我们在 create table 时不指定表的存储引擎类型,默认会给你设置存储引擎为 InnoDB。

## Innodb 底层原理与 Mysql 日志机制

​![image](/assets/img/image-20240403160333-mvh4sjm.png)​

1. 更新前，mysql 会根据索引查找到相应数据，并将该数据所在的页，加载到 BufferPool 中；
2. 更新前，mysql 将更新数据的旧值写入 undo 日志，便于回滚；
3. mysql 将 BufferPool 中的数据进行更新；
4. 事务准备提交时，mysql 将更新后数据写入 redo log 日志缓存中，redo log 日志主要作用是在 mysql 启动时，恢复 BufferPool 中数据，保证数据一致性；
5. mysql 将 readLog 日志缓存刷入磁盘；
6. 事务准备提交时，mysql 将更新后数据写入 binlog 日志，以便于恢复磁盘数据；
7. 事务提交后，更新完 binlog 日志后，向 readLog 日志写入 commit 标志，保证 readLog 与 binlog 日志一致。
8. BufferPool 的磁盘 I/O 会不定时将 BufferPool 中数据刷入磁盘相应数据。

### 设计原因

因为来一个请求就直接对磁盘文件进行随机读写，然后更新磁盘文件里的数据性能可能相当差。磁盘随机读写的性能是非常差的，所以直接更新磁盘文件是不能让数据库抗住很高并发的。

Mysql 这套机制看起来复杂，但它可以保证每个更新请求都是更新内存 BufferPool，然后顺序写日志文件，同时还能保证各种异常情况下的数据一致性。

更新内存的性能是极高的，然后顺序写磁盘上的日志文件的性能也是非常高的，要远高于随机读写磁盘文件。正是通过这套机制，才能让我们的 MySQL 数据库在较高配置的机器上每秒可以抗下几干甚至上万的读写请求。

### redo log 重做日志关键参数

​`innodb_log_buffer_size`​:设置 redo log buffer 大小参数，默认 16M ，最大值是 4096M，最小值为 1M。

```sql
show variables like '%innodb_log_buffer_size%';
```

​`innodb_log_group_home_dir`​：设置 redo log 文件存储位置参数，默认值为"./"，即 innodb 数据文件存储位置，其中的 ib_logfile0 和 ib_logfile1 即为 redo log 文件。

```sql
show variables like '%innodb_log_group_home_dir%';
```

​![image](/assets/img/image-20240403160813-2byvl4q.png)​

​`innodb_log_files_in_group`​：设置 redo log 文件的个数，命名方式如: ib_logfile0, iblogfile1... iblogfileN。默认 2 个，最大 100 个。

```sql
show variables like '%innodb_log_files_in_group%';
```

​`innodb_log_file_size`​：设置单个 redo log 文件大小，默认值为 48M。最大值为 512G，注意最大值指的是整个 redo log 系列文件之和，即(innodb_log_files_in_group * innodb_log_file_size)不能大于最大值 512G。

```sql
show variables like '%innodb_log_file_size%';
```

### redo log 写入磁盘过程分析

以两个文件为例子，redo log 从文件头开始顺序写日志，写完第一个文件的结尾，转到第二个文件的头部开始。当写到第二个文件的结尾时，再转到第一个文件开头开始循环写。

​![image](/assets/img/image-20240403161932-4rw0xdw.png)​

* write pos：当前记录位置，写日志时向后移动，当移动到 3 文件的结尾时，转到 0 文件的开头。
* check point：当前要擦除的位置，也是向后移动循环使用，在擦除前需要将内容刷到磁盘中。

write pos 和 check point 中间就是可写区域，记录 bufferPool 更新操作日志，当 write pos 追上 check point 时代表文件无可写入内容，此时不能执行更新操作，需要等待内容刷新到硬盘，check point 推进后才可以继续执行更新。

​`innodb_flush_log_at_trx_commit`​：这个参数控制 redo log 的写入策略，有三种可能取值：

* 0-表示每次提交事务，都将 redo log 留在 redo log buffer 中，此时如果 mysql 宕机，会丢失数据
* 1(默认)-表示每次提交事务，都将 redo log 直接持久化到硬盘，数据最安全，不会因为服务宕机而丢失数据但效率会差一些，线上系统推荐使用这个值
* 2-表示每次提交事务，都将 redo log 写到操作系统的 page cache 里，由操作系统决定什么时候持久化到硬盘，这种不会因为服务宕机而丢失数据，但是操作系统如果宕机了，page cache 里的数据还没来得及写入磁盘文件的话就会丢失数据

InnoDB 有一个后台线程，每隔 1 秒，就会把 redo log buffer 中的日志，调用 操作系统函数 write 写到文件系统的 page cache，然后调用操作系统函数 fsync 持久化到磁盘文件。

​![image](/assets/img/image-20240403165328-dw7rtmw.png)​

```sql
# 查看innodb_flush_log_at_trx_commit参数值：
show variables like 'innodb_flush_log_at_trx_commit';
# 设置innodb_flush_log_at_trx_commit参数值(也可以在my.ini或my.cnf文件里配置)：
set global innodb_flush_log_at_trx_commit=1;  
```

## BinLog二进制归档日志

binlog保存了所有修改操作，不保存查询操作，如果mysql服务意外停止，可通过二进制文件排查，用户操作和表结构操作，可以用来恢复硬盘上的数据库数据。

> 启用binlog会影响服务器性能，但如果需要恢复数据或主从复制，好处大于下降的这些性能！

```sql
# 查看binlog相关参数
show variables like '%log_bin%';
```

mysql8.0默认开启了biglog，在mysql5.7版本中默认是关闭状态

​![image](/assets/img/image-20240403174740-tjg4pe9.png)
![image](/assets/img/image-20240403174822-cetbo46.png)​

打开binlog功能，需要修改配置文件my.ini(windows)或my.cnf(linux)，然后重启数据库

```ini
# log-bin设置binlog的存放位置，可以是绝对路径，也可以是相对路径，这里写的相对路径，则binlog文件默认会放在data数据目录下
log-bin=mysql-nbinlog
# Server Id是数据库服务器id，随便写一个数都可以，这个id用来在mysql集群环境中标记唯一mysql服务器，集群环境中每台mysql服务器的id不能一样，不加启动会报错
server-id=1
# 其他配置
binlog_format = row # 日志文件格式
expire_logs_days = 15 # 执行自动删除距离当前15天以前的binlog日志文件的天数， 默认为0， 表示不自动删除
max_binlog_size = 200M # 单个binlog日志文件的大小限制，默认为 1GB
```

‍
