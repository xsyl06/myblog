---
title: 06-JVM工具详解
order: 6
date: 2024-04-10
category:
  - JVM
tag:
  - JVM
---

## 前置启动程序

事先启动一个web程序，使用jps查看其进程id，接着可以使用各种java提供的工具排查、优化应用

## jmap

此命令能查看内存信息，实例个数及占用内存大小。

### jmap -histo

```shell
#查看历史生成的实例
jmap -histo pid

#查看当前存活的实例，执行过程中可能会触发一次fullGC
jmap -histo:live pid
```

​![image](/assets/img/image-20240409100437-7lnjn47.png)​

​![image](/assets/img/image-20240409100609-pow9146.png)​

* num：序号
* instances：实例数量
* bytes：占用空间大小
* class name：类名称，[C is a char[]，[S is a short[]，[I is a int[]，[B is a byte[]，[[I is a int[][]

### jmap -heap

查看堆信息

```shell
#JDK8查看堆内存信息
jmap -heap pid
#JDK17查看堆内存信息
jhsdb jmap --heap --pid pid
```

​![image](/assets/img/image-20240409103825-aqwateh.png)​

### 导出堆内对象信息

```shell
#导出堆内对象信息到文件
 jmap -dump:format=b,file=dump.hprof pid
```

也可以设置内存溢出自动导出dump文件(内存很大的时候，可能会导不出来)

1. -XX:+HeapDumpOnOutOfMemoryError
2. -XX:HeapDumpPath=./   （路径）

导出文件后，可通过jvisualvm命令工具导入该hprof文件分析

::: note idea分析堆文件

idea中通过View->Tool Windows->Profiler打开分析界面，在界面右方点击打开本地的hprof文件进行分析，如果同时打开了对应的工程，还可直接检测到这个类的哪一行不断产生大对象导致堆溢出

[jvm内存溢出排查（使用idea自带的内存泄漏分析工具)_idea jvm内存分析工具-CSDN博客](https://blog.csdn.net/weixin_43982359/article/details/132316552)

:::

## jstack

栈信息，可通过该命令查找死锁

### jstack pid

```java
public class DeadLockTest {

   private static Object lock1 = new Object();
   private static Object lock2 = new Object();

   public static void main(String[] args) {
      new Thread(() -> {
         synchronized (lock1) {
            try {
               System.out.println("thread1 begin");
               Thread.sleep(5000);
            } catch (InterruptedException e) {
            }
            synchronized (lock2) {
               System.out.println("thread1 end");
            }
         }
      }).start();

      new Thread(() -> {
         synchronized (lock2) {
            try {
               System.out.println("thread2 begin");
               Thread.sleep(5000);
            } catch (InterruptedException e) {
            }
            synchronized (lock1) {
               System.out.println("thread2 end");
            }
         }
      }).start();

      System.out.println("main thread end");
   }
}
```

​![image](/assets/img/image-20240409111335-nx778bd.png)​

* "Thread-1" 线程名
* prio=5 优先级=5​
* tid=0x000000001fa9e000 线程id​
* nid=0x2d64 线程对应的本地线程标识nid​
* java.lang.Thread.State: BLOCKED 线程状态

​![image](/assets/img/image-20240409111423-cj1c3cc.png)​

还可以用jvisualvm自动检测死锁

​![image](/assets/img/image-20240410112715-v41surk.png)​

### jstack找出占用CPU最高的线程

```java
package com.tuling.jvm;

/**
 * 运行此代码，cpu会飙高
 */
public class Math {

    public static final int initData = 666;
    public static User user = new User();

    public int compute() {  //一个方法对应一块栈帧内存区域
        int a = 1;
        int b = 2;
        int c = (a + b) * 10;
        return c;
    }

    public static void main(String[] args) {
        Math math = new Math();
        while (true){
            math.compute();
        }
    }
}
```

1. 使用命令`top -p pid`​显示你的java进程内存情况

​![1658140090631-f548d54b-2576-4561-9ecd-8345d22d71c3](/assets/img/net-img-1658140090631-f548d54b-2576-4561-9ecd-8345d22d71c3-20240410112951-7pmfewp.png)​

2. 大写H，展示进程中的线程ID

​![image](/assets/img/image-20240410112942-16zawla.png)​

3. 找到内存和CPU占用较高的tid比如19664
4. 通过printf "%x" pid 转换为十六进制得到0x4cd0，此为线程的十六进制表示
5. 执行jstack 19663 |grep -A 10 4cd0得到线程堆栈信息中4cd0的这个线程号后面10行的信息，从堆栈信息中cpu飙高的代码行信息

​![image](/assets/img/image-20240410141141-8vb6b06.png)​

6. 查看对应的堆栈信息找出可能存在问题的代码

## jinfo

查看正在运行的java的运行参数

### jinfo -flags pid

查看java参数

​![image](/assets/img/image-20240410141316-cazuqpo.png)​

### jinfo -sysprops pid

查看java系统参数

​![image](/assets/img/image-20240410141409-dm80u2g.png)​

## jstat

jstat命令可以查看堆内存各部分的使用量，以及加载类的数量。命令的格式如下：

jdk8：jstat [-命令选项] [vmid] [间隔时间(毫秒)] [查询次数]

```shell
#命令选项
-class：显示ClassLoader的相关信息
-compiler：显示JIT编译的相关信息
-gc：显示与GC相关信息
-gccapacity：显示各个代的容量和使用情况
-gccause：显示垃圾收集相关信息（同-gcutil），同时显示最后一次或当前正在发生的垃圾收集的诱发原因
-gcnew：显示新生代信息
-gcnewcapacity：显示新生代大小和使用情况
-gcold：显示老年代信息
-gcoldcapacity：显示老年代大小
-gcpermcapacity：显示永久代大小
-gcutil：显示垃圾收集信息
-printcompilation：输出JIT编译的方法信息
-t：在输出信息前加上一个Timestamp列，显示程序的运行时间
-h：可以在周期性数据输出后，输出多少行数据后，跟着一个表头信息
间隔时间：用于指定输出统计数据的周期，单位为毫秒
查询次数：用于指定一个输出多少次数据
```

### JVM**运行情况预估**

用 jstat gc -pid 命令可以计算出如下一些关键数据，有了这些数据就可以采用之前介绍过的优化思路，先给自己的系统设置一些初始性的JVM参数，比如堆内存大小，年轻代大小，Eden和Survivor的比例，老年代的大小，大对象的阈值，大龄对象进入老年代的阈值等。

#### **年轻代对象增长的速率**

可以执行命令 jstat -gc pid 1000 10 (每隔1秒执行1次命令，共执行10次)，通过观察EU(eden区的使用)来估算每秒eden大概新增多少对象，如果系统负载不高，可以把频率1秒换成1分钟，甚至10分钟来观察整体情况。注意，一般系统可能有高峰期和日常期，所以需要在不同的时间分别估算不同情况下对象增长速率。

#### **Young GC的触发频率和每次耗时**

知道年轻代对象增长速率我们就能推根据eden区的大小推算出Young GC大概多久触发一次，Young GC的平均耗时可以通过 YGCT/YGC 公式算出，根据结果我们大概就能知道系统大概多久会因为Young GC的执行而卡顿多久。

#### **每次Young GC后有多少对象存活和进入老年代**

这个因为之前已经大概知道Young GC的频率，假设是每5分钟一次，那么可以执行命令 jstat -gc pid 300000 10 ，观察每次结果eden，survivor和老年代使用的变化情况，在每次gc后eden区使用一般会大幅减少，survivor和老年代都有可能增长，这些增长的对象就是每次Young GC后存活的对象，同时还可以看出每次Young GC后进去老年代大概多少对象，从而可以推算出老年代对象增长速率。

#### **Full GC的触发频率和每次耗时**

知道了老年代对象的增长速率就可以推算出Full GC的触发频率了，Full GC的每次耗时可以用公式 FGCT/FGC 计算得出。

#### **优化思路**

其实简单来说就是尽量让每次Young GC后的存活对象小于Survivor区域的50%，都留存在年轻代里。尽量别让对象进入老年代。尽量减少Full GC的频率，避免频繁Full GC对JVM性能的影响。

## 内存泄漏的一些事

一般电商架构可能会使用多级缓存架构，就是redis加上JVM级缓存，大多数同学可能为了图方便对于JVM级缓存就简单使用一个hashmap，于是不断往里面放缓存数据，但是很少考虑这个map的容量问题，结果这个缓存map越来越大，一直占用着老年代的很多空间，时间长了就会导致full gc非常频繁，这就是一种内存泄漏，对于一些老旧数据没有及时清理导致一直占用着宝贵的内存资源，时间长了除了导致full gc，还有可能导致OOM。

这种情况完全可以考虑采用一些成熟的JVM级缓存框架来解决，比如ehcache等自带一些LRU数据淘汰算法的框架来作为JVM级的缓存。

‍
