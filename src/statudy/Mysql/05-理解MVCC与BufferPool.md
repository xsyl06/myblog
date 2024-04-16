---
title: 05-理解MVCC与BufferPool
order: 5
date: 2024-04-15
category:
  - Mysql
tag:
  - Mysql
---

## MVCC多版本控制机制

MySql在可重复读的事务隔离机制下，如何保证事务较高的隔离级别，同样的查询语句在一个事务里如何做到查询相同的结果的，就算有其他事务对数据进行修改也不影响该事务内的查询结果。  
这个隔离性就是靠着**MVCC(Multi-Version Concurrency Control)** 机制来保证的，对同一行数据的读默认不加互斥锁来保证隔离性，避免的频繁加锁解锁带来的性能问题。MySql默认在可重复读和读已提交的事务隔离情况下都实现了MVCC

### undo日志版本链和read-veiw机制

undo日志版本链是指一行数据被多个事务修改，在每个事务修改完之后，mysql会保留本次修改的数据到undo回滚日志，并且用两个字段trx_id和roll_pointer来记录本次修改的事务id和回滚的指针，其中回滚的指针指向修改前的数据。这样undo日志链可以将数据串联成一个历史版本链

​![image](/assets/img/image-20231127163449-w9utnr1.png)​

一个事务开启后，**当执行第一条sql语句时会生成read-view(一致性视图)** ，该视图在事务结束前都不会改变(读已提交的隔离级别则在每次执行查询语句的时候重新生成read-view)

read-view由生成时仍在活跃的事务id(**未提交的事务id**)数组，和**已创建的最大的事务id**组成，其中未提交事务数组中最小的事务id为min_trx_ids，已创建的最大事务id为max_trx_ids，事务里的任何sql查询，都需要从undo日志链中的最新数据开始，逐一与read-view做比较，以得到最终结果。

#### 比对方式

事务的sql查询时，会先从undo日志链中获取最新的一条数据，读取trx_id，然后与read-view比较：

* 当 trx_id < min_trx_ids时，表明该数据最后修改的事务id比生成的read-view中最小的事务id还小，表示是已经提交过的事务，数据可以展示。
* 当 trx_id > max_trx_ids时，表明该数据最后修改的事务id比生成read-veiw时最大的事务id还大，表示这是未来事务提交的数据，数据不可展示。
* 当 min_trx_ids ≤ trx_id ≤ max_trx_ids 时，表明该数据落入read-veiw视图中，需进一步判断：

  * 当trx_id在read-veiw的活跃事务数组中时，则表明提交该数据的事务在生成视图时仍在活跃，数据不可以展示(当trx_id和当前事务id一致时，则表明是该事务提交的数据，此时可以展示)。
  * 当trx_id不在read-veiw的活跃事务数组中时，则表明提交该数据的事务在生成视图时已经提交，数据可以展示。
* 所有不可展示的条件，会再根据roll_pointer查找到上一个版本的数据，再根据规则进行比较，直到查找到可以展示的数据。

**注意：begin/start transaction并不是一个事务的起点，这个时候mysql还没有分配事务id，只有当执行了修改innodb表的语句时，才真正启动事务，向mysql申请事务id，mysql内部是严格按照启动顺序来分配事务id的。**

## **Innodb引擎SQL执行的BufferPool缓存机制**

​![image](/assets/img/image-20231127163529-wcwkk5a.png)​

1. 更新前，mysql会根据索引查找到相应数据，并将该数据所在的页，加载到BufferPool中；
2. 更新前，mysql将更新数据的旧值写入undo日志，便于回滚；
3. mysql将BufferPool中的数据进行更新；
4. 事务准备提交时，mysql将更新后数据写入readLog日志缓存中，readLog日志主要作用是在mysql启动时，恢复BufferPool中数据，保证数据一致性；
5. mysql将readLog日志缓存刷入磁盘；
6. 事务准备提交时，mysql将更新后数据写入binlog日志，以便于恢复磁盘数据；
7. 事务提交后，更新完binlog日志后，向readLog日志写入commit标志，保证readLog与binlog日志一致。
8. BufferPool的磁盘I/O会不定时将BufferPool中数据刷入磁盘相应数据。

### 设计原因

因为来一个请求就直接对磁盘文件进行随机读写，然后更新磁盘文件里的数据，性能可能相当差。磁盘随机读写的性能是非常差的，所以直接更新磁盘文件是不能让数据库抗住很高并发的。  
Mysql这套机制看起来复杂，但它可以保证每个更新请求都是更新内存BufferPool，然后顺序写日志文件，同时还能保证各种异常情况下的数据一致性。  
更新内存的性能是极高的，然后顺序写磁盘上的日志文件的性能也是非常高的，要远高于随机读写磁盘文件。正是通过这套机制，才能让我们的MySQL数据库在较高配置的机器上每秒可以抗下几干甚至上万的读写请求。
