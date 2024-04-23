---
title: 01-Redis核心数据结构与高性能
order: 3
index: true
date: 2024-04-21
category:
  - Redis
tag:
  - Redis
---

## Redis的单线程和高性能

### Redis是单线程吗

Redis的单线程是指网络I/O和键值对的读写的时候是由一个线程来完成的，这也是Redis对外提供键值存储服务的主要流程，但Redis的其他功能，比如持久化、主从同步、集群数据同步、异步删除等都是其他线程完成的。

### Redis单线程为什么这么快

因为Redis的数据是存储在**内存**中的，所有运算都是内存级别的，而单线程避免了线程切换上下文带来的损耗问题。但也正因为Redis是单线程的，使用时需要注意考虑耗时指令带来的影响，比如keys*等，否则可能会带来Redis卡顿等问题。

### Redis单线程如何处理那么多并发客户连接

Redis的客户连接处理使用的是通过epoll来实现的I/O多路复用技术，将连接放到队列中，依次放到文件事件分配器中，文件事件分配器将事件分发给具体的事件处理器处理。

​![image](/assets/img/image-20240419175358-kdm8c0m.png)​

```shell
# 查看redis支持的最大连接数，在redis.conf文件中可修改，# maxclients 10000
127.0.0.1:6379> CONFIG GET maxclients
    ##1) "maxclients"
    ##2) "10000"
```

## Redis其他高级命令

### **keys**

全量遍历键，用来列出所有满足特定正则字符串规则的key，当redis数据量比较大时，性能比较差，要避免使用

​![image](/assets/img/image-20240419175508-u0a0ed8.png)​

### scan

渐进式遍历键

SCAN cursor [MATCH pattern] [COUNT count]

scan 参数提供了三个参数，第一个是 cursor 整数值(hash桶的索引值)，第二个是 key 的正则模式，第三个是一次遍历的key的数量(参考值，底层遍历的数量不一定)，并不是符合条件的结果数量。第一次遍历时，cursor 值为 0，然后将返回结果中第一个整数值作为下一次遍历的 cursor。一直遍历到返回的 cursor 值为 0 时结束。

注意：但是scan并非完美无瑕， 如果在scan的过程中如果有键的变化（增加、 删除、 修改） ，那么遍历效果可能会碰到如下问题： 新增的键可能没有遍历到， 遍历出了重复的键等情况， 也就是说scan并不能保证完整的遍历出来所有的键， 这些是在开发时需要考虑到的。

​![image](/assets/img/image-20240419180025-0u4y835.png)
![image](/assets/img/image-20240419180032-vhbwkr2.png)​

### Info

查看redis服务运行信息，分为 9 大块，每个块都有非常多的参数，这 9 个块分别是

* Server 服务器运行的环境参数
* Clients 客户端相关信息
* Memory 服务器运行内存统计数据
* Persistence 持久化信息
* Stats 通用统计数据
* Replication 主从复制相关信息
* CPU CPU 使用情况
* Cluster 集群信息
* KeySpace 键值对统计数量信息

​![image](/assets/img/image-20240419180148-qqcjokf.png)​
