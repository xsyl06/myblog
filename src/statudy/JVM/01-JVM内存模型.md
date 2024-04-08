---
title: 01-JVM内存模型
order: 1
date: 2024-03-29
category:
  - JVM
tag:
  - JVM
---
<h1>01-JVM内存模型</h1>

# 一、类加载机制

​![image](/assets/img/image-20240219224259-1900g0v.png)​

# 二、JVM相关参数

​![image](/assets/img/image-20240219223921-xvwg45u.png)​

* -Xss：每个线程的栈大小
* -Xms：设置堆的初始可用大小，默认物理内存的1/64
* -Xmx：设置堆的最大可用大小，默认物理内存的1/4
* -Xmn：新生代大小
* -XX:NewRatio：默认2表示新生代占年老代的1/2，占整个堆内存的1/3
* -XX:SurvivorRatio：默认8表示一个survivor区占用1/8的Eden内存，即1/10的新生代内存

元空间设置参数有两个：

* -XX:MaxMetaspaceSize ：元空间最大值，默认-1，不限制，只受限于本地物理内存大小
* -XX:MetaspaceSiz：指定元空间触发Fullgc的初始阈值(元空间无固定初始大小)， 以字节为单位，默认是21M左右，达到该值就会触发full gc进行类型卸载， 同时收集器会对该值进行调整： 如果释放了大量的空间， 就适当降低该值； 如果释放了很少的空间， 那么在不超过-XX：MaxMetaspaceSize（如果设置了的话） 的情况下， 适当提高该值。这个跟早期jdk版本的-XX:PermSize参数意思不一样，-XX:PermSize代表永久代的初始容量。

由于调整元空间大小需要Fullgc，很耗费开销。在应用启动过程中发生大量Fullgc，通常是元空间发生了大小调整，基于这种情况，一般建议将JVM参数-XX:MaxMetaspaceSize和-XX:MetaspaceSize设置成一样的值，并且设置的比初始值要大，对于8G内存的系统来说，一般可以设置成256M。

‍
