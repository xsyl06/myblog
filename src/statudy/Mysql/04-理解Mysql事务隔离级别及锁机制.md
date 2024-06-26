---
title: 04-Mysql事务隔离级别及锁机制
order: 4
date: 2024-04-14
category:
  - Mysql
tag:
  - Mysql
---

## 概述

数据库通常会并发的执行多个事务，这些事务可能会对同一条数据进行增删改等操作，这可能会产生脏读，脏写，不可重复读等问题。

这些问题的本质就是数据的并发问题，所以数据库设计了事务隔离、锁等机制来解决多事务并发问题。

## 事务及ACID属性

* **原子性：** 一个事务内的所有sql语句要么同时成功，要么同时失败，这条是操作层面的，原子性由undo log来实现。
* **一致性：** 事务开始和结束时，数据需要保持一致，即一个事务内多条sql修改的数据，要么都成功，要么都失败，这条主要时数据层面的。
* **隔离性：** 数据库需提供一定隔离性，保证每个事务在并发情况下，有自己“独立”的执行空间，不受其他事务影响。
* **持久性：** 事务提交后对数据的修改是永久性的，不应受系统影响。

## 并发事务带来的问题

* **脏写：** 当两个或多个事务同时选定了一条数据进行更新，由于不知道其他事务的存在，都是基于最初查询的值进行更新，会导致最后提交的更新覆盖之前提交的更新。
* **脏读：** 当一个事务A对一条数据进行修改，读取到了另一个事务B对该数据未提交的修改，在A事务数据根据之前读取的修改后，事务B进行了回滚，此时A事务的基础数据即是错误数据，不符合一致性要求。
* **不可重复读：** 一个事务按相同查询条件查询数据，不同时间点出现了数据前后不一致情况，即事务A读取一次数据后，事务B修改了该条数据并提交，然后事务A再次读取该条数据时，发现数据被修改和删除了；不符合隔离性要求。
* **幻读：** 一个事务重新读取之前的查询结果，读取到了其他事务插入的满足查询条件的数据，就是幻读，不符合隔离性。

## 数据库锁分类

锁是计算机协调多个线程或进程并发访问同一资源的机制，

数据库中，除了计算传统的资源(CPU、RAM、I/O)外，数据库内数据也是一种资源，会面临多个事务并发访问或修改同一条数据的问题。如何保证数据在并发情况下的一致性，有效性，是所有数据库需要解决的一个问题。锁冲突也是影响并发效率的一个方面。

### 锁分类

* 从性能上分为**乐观锁**(用版本比对)和**悲观锁**；

* 从对数据库的操作上分为**读锁**和**写锁**
  * **读锁**：针对同一份数据，多个读之间不影响，该session的写操作会报错，其余session的写操作会阻塞。  
    select * from dual lock in share mode;
  * **写锁：** 当前的写操作没有执行完，不释放锁，其他session的写操作和读操作会阻塞。  
    slelect * from dual for update;
* 从对数据的操作粒度上分为**表锁**和**行锁**
  * **表锁：** 每次操作锁住整张表。开销小，加锁快；锁定颗粒度大，锁冲突概率高，几乎不会出现并发问题。一般用于整表数据迁移场景。

### 表锁

对某一个表加表锁：lock table 表名 read/write;

​![image](/assets/img/image-20231127111535-5c1xzma.png)​

查看表状态：show open tables;

​![image](/assets/img/image-20231127112322-mbyxpb8.png)​

#### 添加读锁的情况

对表添加读锁后，当前session更新数据会报错

​![image](/assets/img/image-20231127112419-rp76ptt.png)​

此时，因为加的是**读锁**，当前session和其他session均可以读出数据

​![image](/assets/img/image-20231127112429-ycfwljv.png)​

其余session修改会阻塞

​![image](/assets/img/image-20231127112727-ydzcxfk.png)​

当释放锁后其余session语句会继续执行

​![image](/assets/img/image-20231127112804-i244dnj.png)​

​![image](/assets/img/image-20231127112808-tjsls74.png)​

#### 添加写锁情况

添加写锁后，自己可正常读取，可正常修改

​​![image](/assets/img/image-20231127113028-xlh0k1f.png)​​

其他session读取会阻塞

​![image](/assets/img/image-20231127113036-p9byk58.png)​

释放后其余session可以读取到。

​![image](/assets/img/image-20231127113100-elxe5b8.png)​

​![image](/assets/img/image-20231127113104-zk4ep3j.png)​

结论：

1. 对MyISAM表的读操作(加读锁) ,不会阻塞其他进程对同一表的读请求,但会阻塞对同一表的写请求。只有当读锁释放后,才会执行其它进程的写操作。
2. 对MylSAM表的写操作(加写锁) ,会阻塞其他进程对同一表的读和写操作,只有当写锁释放后,才会执行其它进程的读写操作

### 行锁

每次操作对某行数据进行加锁，加锁开销大，加锁慢，会出现死锁情况，锁定颗粒度小，发生锁冲突的概率低，并发能力高。**InnoDB支持事务及行级锁**

## 事务的隔离级别

|**隔离级别**|**脏读**|**不可重复读**|**幻读**|
| :----------------: | --| --| --|
|**读未提交**read-uncommitted|**可能出现**|**可能出现**|**可能出现**|
|**读已提交**reda-committed|**不可能出现**|**可能出现**|**可能出现**|
|**可重复读**repeatable-read|**不可能出现**|**不可能出现**|**可能出现**|
|**串行化**serializable|**不可能出现**|**不可能出现**|**不可能出现**|

数据库事务隔离级别越严格，并发影响的越小，当代价也越高  
查看数据库事务隔离级别的语句：show variables like 'tx_isolation';  
设置数据库事务隔离级别的语句：set tx_isolaticton='read-uncommitted'  
mysql8的关键字为： transaction_isolation

### 读未提交

```sql
set transaction_isolation='read-uncommitted';
```

1、打开客户端A，设置隔离级别为读未提交  
2、打开客户端B，设置隔离级别为读未提交  
3、在客户端B中，修改lilei的balances-50但不提交，并在A中查询，显示减少了50  
4、在A客户端中，在B客户端修改了数据后，再次进行数据计算，balance-50，此时事务被阻塞，说明B事务在更新数据时添加了行级锁  
5、此时B进行了回滚后，所有的操作都将会被撤销，那客户端A查询到的数据其实就是脏数据。此时A如果再进行balance-50，其值也是400，因为数据库会拿真实数据进行计算。

### 读已提交

```sql
set transaction_isolation='read-committed';
```

1、客户端A设置隔离模式为读已提交，此时A开启事务，正常读取数据  
2、客户端B设置隔离模式为读已提交，此时B开启事务，此时B更新相同数据不提交。  
3、客户端A再次查询数据，数据不变，解决了脏读问题。  
4、客户端B提交事务。此时客户端A再查一次，查询到客户端B修改的数据，没有满足可重复读要求，对代码编写有很大影响。

### 可重复读

```sql
set transaction_isolation='repeatable-read';
```

1、客户端A设置隔离模式为可重复读，此时A开启事务，正常读取数据。  
2、客户端B设置隔离模式为可重复读，此时B开启事务，修改一条数据不提交。  
3、客户端A再次查询数据，数据不变，解决了脏读问题。  
4、客户端B提交事务。此时客户端A再查一次，查询到仍为第一次查询的数据(mysql通过MVCC机制读取历史版本)，解决了不可重复读问题。  
5、如果事务A需要修改数据，需要考虑其他事务修改的情况。

### **串行化**

```sql
set transaction_isolation='serializable';
```

1、客户端A设置隔离模式为串行化，此时A开启事务，正常读取数据。  
2、客户端B设置隔离模式为串行化，此时B可以正常读取数据，但修改A正读取的数据时，会阻塞。  
3、当客户端A提交事务后，其余事务才可以继续操作数据。

## **间隙锁**

间隙锁，锁的就是两个值之间的空隙。Mysql默认级别是repeatable-read，有办法解决幻读问题吗？间隙锁在某些情况下可以解决幻读问题。间隙锁是在可重复读隔离级别下才会生效。

​![image](/assets/img/image-20231127152509-2dh8tn5.png)​

在Session_1下面执行 update account set name = 'zhuge' where id > 8 and id <18;，则其他Session没法在这个范围所包含的所有行记录(包括间隙行记录)以及行记录所在的间隙里插入或修改任何数据，即id在(3,20]区间都无法修改数据，注意最后那个20也是包含在内的。

### 临键锁(Next-key Locks)

**临键锁**是行锁与间隙锁的组合。像上面那个例子里的这个(3,20]的整个区间可以叫做临键锁。其实主要是最后那个**20。**\n
无索引行锁会升级为表锁(RR级别会升级为表锁，RC级别不会升级为表锁)  
因为锁主要加在索引上，如果更新条件为非索引字段，在可重复读的隔离级别下，行锁可能会升级为表锁。

**InnoDB的行锁是针对索引加的锁，不是针对记录加的锁。并且该索引不能失效，否则都会从行锁升级为表锁。**

## 结论

​Innodb存储引擎由于实现了行级锁定，虽然在锁定机制的实现方面所带来的性能损耗可能比表级锁定会要更高一下，但是在整体并发处理能力方面要远远优于MYISAM的表级锁定的。当系统并发量高的时候，Innodb的整体性能和MYISAM相比就会有比较明显的优势了。

但是，Innodb的行级锁定同样也有其脆弱的一面，当我们使用不当的时候，可能会让Innodb的整体性能表现不仅不能比MYISAM高，甚至可能会更差。

## 锁分析

### 1、通过检查InnoDB_row_lock状态变量来分析系统上的行锁的争夺情况

```sql
show status like 'innodb_row_lock%';
```

对各个状态量的说明如下：

* Innodb_row_lock_current_waits: 当前正在等待锁定的数量
* Innodb_row_lock_time: 从系统启动到现在锁定总时间长度
* Innodb_row_lock_time_avg: 每次等待所花平均时间
* Innodb_row_lock_time_max：从系统启动到现在等待最长的一次所花时间
* Innodb_row_lock_waits: 系统启动后到现在总共等待的次数

当等待次数很高，且等待所花平均时间较长时，需要分析为什么有这么多等待，然后根据分析结果进行优化。

### 2、查看infomation_schema库中锁相关表

```sql
-- 查看事务
select * from INFORMATION_SCHEMA.INNODB_TRX;

-- 查看锁
select * from INFORMATION_SCHEMA.INNODB_LOCKS;

-- 8.0查看锁
select * from `performance_schema`.data_locks

-- 查看锁等待
select * from INFORMATION_SCHEMA.INNODB_LOCK_WAITS;

-- 8.0查看锁等待
select * from `performance_schema`.data_lock_waits;

-- 释放锁，trx_mysql_thread_id可以从INNODB_TRX表里查看到
kill trx_mysql_thread_id

-- 查看锁等待详细信息
show engine innodb status\G; 
```

### **死锁**

```sql
A:select * from account for update;
B:select * from actor for update;
A:select * from actor for update;
B:select * from account for update;
```

​![image](/assets/img/image-20231127155844-rfj0byk.png)​

最后可以看到mysql会自动检测出死锁的情况，并回滚产生死锁的那个事务，但有些情况数据库没法检测到。

### **锁优化建议**

* 更新时尽可能让所有数据检索都通过索引来完成，避免无索引行锁升级为表锁。
* 合理设计索引，尽量缩小锁的范围。
* 尽可能减少检索条件范围，避免间隙锁。
* 尽量控制事务大小，减少锁定资源量和时间长度，涉及事务加锁的sql尽量放在事务最后执行。
* 尽可能低级别事务隔离。
