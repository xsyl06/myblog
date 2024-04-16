---
title: 03-Mysql索引优化二
order: 3
date: 2024-04-13
category:
  - Mysql
tag:
  - Mysql
---

## 分页查询 limit start,end

常见的mysql分页写法

```sql
select * from employees limit 90000,10;
```

limit 90000,10 这种写法，mysql会查询出90010条数据，然后将前面90000条数据丢弃，保留最后10条数据。

### 优化

以下优化方式各有优缺点，需要根据业务需要灵活选择。

#### 当主键连续且自增，并且根据主键排序时

可改写为以主键为条件，查询所需条数的写法。

```sql
select * from employees where id > 90000 limit 10;
```

以上条件在实际生产中一般不会出现，业务中删除操作可能会导致主键不连续，同时如果根据非主键排序，也会导致结果不准确。

#### 主键不连续

当主键不连续时，还有一种一般以最初查询出的数据最后一条的某个字段(一般为创建时间)为条件，查询大于这个条件的后10条或后几条，写法如下

```sql
select * from employees where hire_time>'2022-04-28 06:34:28' limit 10;
select * from employees where hire_time>'2022-05-05 03:00:23' limit 10;
```

这种写法也有缺陷，一是需要前端修改分页逻辑，该种查询，前端没有数据总数，需要查询比较靠后的数据需要一步一步点击。二是对where后面的条件也有要求，需要递增，且没有其他条件。

#### 根据非主键字段排序的分页

```sql
select * from employees order by name limit 90000,10;
```

​![image](/assets/img/image-20231126212344-7jdcmhs.png)​

查看执行计划，该sql走了全表扫描，没有走索引，原因是：**该sql语句需查询出非主键的字段，因此，如果走辅助索引，还涉及回表操作，同时因为要limit操作，mysql认为走索引效率不如全表扫描，选择了全表扫描，同时排序使用了文件排序(using filesort)。**

优化关键是让排序时返回的字段尽可能少，所以可以让排序和分页操作先查出主键，然后根据主键查到对应的记录，SQL改写如下。

```sql
select * from employees e inner join (select id from employees order by name limit 90000,10) t on t.id=e.id;
```

## join关联优化

### Nested-Loop Join 嵌套循环连接(NLJ)

一次一行的从第一张表(驱动表)中读取数据，并根据关联关系，去第二张表中关联相关数据，取出满足条件的行，然后取两张表的合集。

此种需要被关联的的关联关系建立了索引

如有t1表(a,b)有10000行数据，且a字段建立了索引；t2表(100)结构与t1表结构完全相同

```sql
explain select * from t1 inner join t2 on t1.a=t2.a;
```

​![image](/assets/img/image-20231126213117-0bxxcpr.png)​

查看执行计划可以看到，t2小表为驱动表

1. mysql先将小表的数据取出来(没有where条件，全表扫描)
2. 然后将数据中a字段的值取出，到t1表中获取数据，因为关联关系在t1表中为索引，因此走索引查询出t1表中的数据。

这种方式磁盘扫描了t2表100行，t1表100行，总共200行，效率还是比较高的。  
同时可以看到，mysql优化器会自动选择较小的表作为驱动表，因此inner join写在左边的表不一定是驱动表。

### Block-Nested-Loop Join 基于块的嵌套循环连接(BNL)

当被驱动表关联关系字段没有建立索引时，mysql会使用基于块的嵌套循环连接(BNL)

```sql
explain select * from t2 inner join t1 on t1.b=t2.b;
```

​![image](/assets/img/image-20231126213331-90d94ig.png)​

**Extra 中 的Using join buffer (Block Nested Loop)说明该关联查询使用的是 BNL 算法。**

1. mysql会先将驱动表t2中的数据取出来存放到内存的join_buffer中。
2. mysql从被驱动表t1中取出每一行数据，与join_buffer中的t2表数据，根据关联关系进行关联。
3. 返回满足join条件的数据。

根据步骤，可以看到，在获取驱动表数据时mysql扫描了t2表数据100行，然后在比对过程中，需要全表扫描t1表10000行，即需要扫描10100次磁盘，同时在内存中的比对极限情况下可能需要执行100*10000=100万次。

### **为什么不用嵌套循环连接(NLJ)呢**

根据NLJ步骤：

1. 从t2表取出一条数据
2. 查询t1表，此时数据没有建立索引，因此mysql需要从头开始扫描B+树的所有叶子节点，根据关联关系获取数据，并将符合条件的数据返回。
3. 重复上述过程。

从过程中可以看到，t2表做全表扫描，扫描了100行数据，然后再扫描t1表，极限状态下每条数据在t1里扫描10000次；总共扫描磁盘100*10000=100万次，效率很低，因此mysql不选择NLJ。

**注意**：join_buffer默认256K，由join_buffer_size参数进行设置。如果放不下t2表数据，mysql会进行切块，分多次存放(**分段放**)。比如join_buffer中可以存放80条数据，但t2表有100行，此时mysql会先放80条数据在join_buffer中，然后取t1数据进行比较；完成后，将join_buffer中数据删除，放剩下20行数据，再取t1数据进行比较。所以此时会多扫一次t1表。

### 优化方法

1. 被驱动表的关联字段添加索引，让mysql尽量走嵌套循环连接(NLJ)。
2. 使用小表驱动大表。
3. 根据阿里开发规范，join的表尽量不要超过三张。

inner join通常情况下mysql执行引擎会优化挑选小表为驱动表，但也有可能会出现优化错误的情况，即数据量大的表为驱动表，此时可使用straight_join指定驱动表，类似如下写法

```sql
select * from t2 straight_join t1 on t1.b=t2.b;
```

​![image](/assets/img/image-20231126213907-9ogaith.png)​

1. straight_join方法只适用与inner join形式，left join和right join已经默认指定了驱动表。
2. 尽量让mysql自己来选择驱动表，大部分情况下，程序判断的比人判断的要准确一些，同时straight_join要慎重使用，因为部分情况下，人为指定的顺序不一定比优化引擎靠谱。

**驱动表的定义：** 应该为两个表按各自条件过滤后，参与连接的数据，那个表参与连接的数据小，就是驱动表，而不是单纯只看表内的数据量。比如下面两个语句。

```sql
select * from t1 inner join t2 on t1.a=t2.a where t1.a<10;
```

​![image](/assets/img/image-20231126214000-ig9ob0o.png)​

当两个表数据量接近

```sql
select * from t1 inner join t2 on t1.a=t2.a where t1.a<80;
```

​![image](/assets/img/image-20231126214044-8dbv6c6.png)​

## in和exists

原则：小表驱动大表

如果表b的数据集大小小于表a，in优先exists

```sql
select * from a where id in (select id from b);
基本等价于
for(select id from b){
  select * from a where a.id=b.id
}
```

当a表数据集小于b表时，exists优先in

```sql
select * from a where exists (select 1 from b where b.id=a.id);
等价于
for(select * from a){
  select * from b where b.id=a.id
}
a和b表连接字段需要添加索引
```

**exists执行逻辑：**

1. 先查询出外面select * from a的数据
2. 然后根据id关联查询b表中数据((select 1 from b where b.id=a.id)，如果在b表中存在，则保留(exists子句返回1)，否则不保留(exists子句返回0)。
3. 语句返回结果

## count()语句

**以下语句执行效率：**

```sql
select count(*) from t1;
select count(1) from t1;
select count(id) from t1;
select count(name) from t1;
```

查看执行计划，可以看到其实计划都一样；

* **当有字段有索引时候的效率：count(*)≈count(1)&gt;count(索引字段)&gt;count(主键)**
  当字段有索引时候，辅助索引只保存了数据主键，索引树大小较小，效率比count(主键)高一点

* 当字段没有索引时候的效率：count(*)≈count(1)>count(主键)>count(字段)  
  当字段没有索引时，mysql主要扫描聚簇索引，即count(主键)从叶子节点扫描，count(字段)需从磁盘加载数据到内存，效率较低。

### **count(1)**

count(1)跟count(字段)执行过程类似，不过count(1)不需要取出字段统计，就用常量1做统计，count(字段)还需要取出字段，所以理论上count(1)比count(字段)会快一点。

### **count(*)**

count(*) 是例外，mysql并不会把全部字段取出来，而是专门做了优化，**不取值，按行累加**，效率很高，所以不需要用count(列名)或count(常量)来替代 count(*)。

### **常见查询优化方法**

#### **查询mysql自己维护的总行数**

对于myisam不带where条件的总行数要求，count的性能很高，因为myisam存储引擎在存储数据时，会将表的总行数存储在磁盘上，直接读取即可，查询不需要计算。

#### **show table status**

如果只需要知道表的总行数估值，可以使用如下命令

```sql
show table status like 'tablename';
```

#### **将总数维护到缓存中如redis**

需要注意的是，插入或删除数据的时候需要同时维护该数据，且最好使用redis原子性增加或减少的方法。

#### **维护相应数据到数据库表中**

可以将统计计数的数据维护到数据库的一个表中，让他们在同一个事务中处理。

‍
