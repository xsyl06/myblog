---
title: 02-深入理解JVM执行引擎
order: 2
date: 2024-03-31
category:
  - JVM
tag:
  - JVM
---
<h1>02-深入理解JVM执行引擎</h1>

# 前端编译与后端编译

## 前端编译

通常认为将java文件编译成class的字节码文件乘坐前端编译。而且在class编译时会对原文件进行一定优化，这种优化不会提高执行效率。

## 后端编译

jvm在执行时，将class的字节码文件解释编译成机器码供计算机执行，称为后端编译

​![image](/assets/img/image-20240318231108-mg2mz1r.png)​

其中前端编译是在 JVM 虚拟机之外执⾏，所以与 JVM 虚拟机没有太⼤的关系。任何编程语言，只要能够编译出满⾜ JVM 规范的 Class ⽂件，就可以提交到 JVM 虚拟机执⾏。⾄于编译的过程，如果你不是想要专⻔去研究语⾔，那么就没有必要太过深⼊的去了解了。这⾥就暂时略过。我们更关注JVM在后端编译过程中如何提升执⾏的效率。

# 字节码指令是如何执行的

## 解释执行与编译执行

class文件中已经保留了每一行java代码对应的字节码，也就是说，jvm执行引擎如何执行一段java代码已经在class文件中确定了，

​![image](/assets/img/image-20240321224816-e9vm5p2.png)​

那么jvm如何执行class的字节码文件呢，最简单的做法就是一个指令就翻译一次成为机器码进行之心，称之为**解释执行**  
但是这种方式需要在上层语言和机器码之间经过中间⼀层JVM字节码的转换，显然执⾏效率是⽐不上C 和 C++那  
些直接面向本地机器指令编程的语言的，这也是长久以前， Java被 C 和 C++开发者吐槽执⾏速度慢的根源

JVM为了加快运行速度，维护了一个CodeCache，将那些字节码指令，提前编译出来放到缓存当中。当再次执行时，会直接从缓存中获取机器码直接执行，这种先编译，后执行的方式称为**编译执行**

但是JVM也不清楚程序员会写出什么样的代码，所以没有办法提前维护出一个完整的字节码缓存，故而退而求其次，将那些运行频率高的热点代码进行提前编译，放到缓存当中

使用java -version就可以看到当前使用的是那种模式

​![image](/assets/img/image-20240321234029-xwgb0jx.png)​

这里可以看出，HotSpot虚拟机并没有直接选择执行效率最高的编译执行模式，而是默认采用了混合模式，兼顾效率和运行成本。因为编译执行需要识别热点代码，需要进行机器编译，需要额外的CodeCache存储编译的代码，另外，在编译执行识别热点代码的过程中，还需要解释执行来帮助提供一些信息支持，因此在HotSpot中，会默认使用混合模式，而不是单纯的使用其中一种模式。

## 热点代码识别

使用JIT实时编译的前提是需要识别出热点代码，要知道某段代码是否是热点代码，是否需要即时编译，这个行为称之为“**热点探测**”。在HotSpot中使**方法调用计数器**和**回边计数器**来实现，在JVM运行参数确定的前提下，这两个计数器都有一个明确的阈值，计数器的计数一旦溢出阈值，就会触发即时编译

* **方法调用计数器：** 就是记录统计方法的调用次数，每当某个方法被调用一次时，就会记录一下该方法的调用次数，当这个方法调用次数非常多，超过了设定的某一个阈值，就可以认为是热点代码。这时就可以向JIT提交针对该方法的热点编译请求。这个阈值默认是**10000次**，可以通过`-XX:CompileThreshold`​来设定

```flow:preset
s=>start: JAVA方法入口
c1=>condition: 是否存在已经编译版本
o1=>operation: 方法调用计数器+1
o2=>operation: 执行编译后的本地代码
c2=>condition: 两计数器之和是否超过阈值
o3=>operation: 向编译器提交请求
o4=>operation: 以解释方法继续执行
e=>end: JAVA方法返回

s->c1(no)->o1->e
s->c1(yes)->o2->c2(yes)->o3->o4->e
s->c1(yes)->o2->c2(no)->o4->e
```

‍

* **回边计数器：** 作用是统计一个方法中循环体代码执行的次数，在字节码中遇到的向后跳转的指令称之为回边，建立回边计数器就是为了发现一个方法体内被频繁调用的循环。回边计数器在默认情况下的阈值是1070

::: tip 阈值计算公式
阈值计算公式：回边计数器阈值=方法调用计数器阈值×(比率-解释器监控比率)/100<br/>
其中比率的值默认为140，解释器监控比率为33，如果都取默认值，那么server模式下的虚拟机回边计数器的阈值就为10700。
:::

## 客户端编译器和服务端编译器

当识别出热点代码后，在编译时不可避免的需要进行编译优化，在HotSpot虚拟机中，热点代码在被JIT即时编译的过程中，JIT会运用很多经典的编译优化技术来实现对字节码指令的优化，让编译出来的机器码运行效率更高。

HotSpot虚拟机内置两个即时编译器，这两个编译器存在已久，分别被称为“客户端编译器”和“服务端编译器”，简称**C1编译器**和**C2编译器。**

C1相当于一个初级编译。在编译过程中，C1会对字节码做简单和可靠的优化，耗时短以达到更快编译的速度。启动快，占用内存小，但翻译出来的机器码优化程度不高，比较适合一些小巧的桌面应用，因此也被称为客户端编译器。

C2相当于一个高级编译。在编译过程中，C2编译器会更加激进的对字节码进行优化，优化后的机器码执行效率更高。但也相应的，占用资源更多，包括启动速度较慢、内存占用多、进行优化的耗时也更长等。比较适合资源相对充裕的服务器，因此也被称为服务端编译器。

但实际上两个编译器不是相互取代而是相互协作的关系。由于即时编译器编译本地代码需要占用程序运行时间，通常要编译出优化程度越高的代码，所花费的时间便会越长；而且想要编译出优化程度更高的代码，解释器可能还要替编译器收集性能监控信息，这对解释执行阶段的速度也有所影响。为了在程序启动响应速度与运行效率之间达到最佳平衡， HotSpot虚拟机在编译子系统中加入了分层编译的功能，分层编译根据编译器编译、优化的规模与耗时，划分出不同的编译层次。

|等级|描述|性能|
| :-----| -------------------------------------------------------------------------------------------------------------| ------|
|0|纯解释执行，并且解释器不开启性能监控|1|
|1|使用C1来将字节码编译为本地机器码，进行简单的优化，不开启性能监控|4|
|2|仍然使用C1编译器来执行，仅开启方法计数器和回边计数器|3|
|3|仍使用C1编译器来执行，开启全部性能监控，除了第2层的统计信息外，还会收集如分支跳转、虚方法调用版本等全部信息|2|
|4|使用C2编译器来执行，相比于C1编译器，C2编译器会对字节码进行更加激进的优化，同时启动会更慢、耗时更长|5|

JDK8中提供的-XX:TieredStopAtLevel=1可以指定使用那一层编译器。

# 后端编译优化技术

之前说过，在解释时，JVM只负责进行翻译和执行，而进行JIT时，会对代码进行一些优化，这使得在大部分情况下，即使程序员写的代码不够优化，JVM也能保证一个不错的执行效率，就成为编译优化技术。

::: note 参数信息
具体的优化策略可参见OpenJDK的WIKI：[PerformanceTacticIndex - PerformanceTacticIndex - OpenJDK Wiki](https://wiki.openjdk.org/display/HotSpot/PerformanceTacticIndex)
:::

## 方法内联(InLine)

方法内联就是将目标方法的执行代码复制到调用该方法的地方，从而避免真实的调用，进一步减少频繁创建栈帧的性能开销。

​![image](/assets/img/image-20240323230255-c9bhz8d.png)​

比如如下代码

```java
public class CompDemo {
    private int add1(int x1,int x2,int x3,int x4){
        return add2(x1,x2)+ add2(x3,x4);
    }
    private int add2(int x1, int x2){
        return x1+x2;
    }
   //内联优化
    private int add(int x1,int x2,int x3,int x4){
        return x1+x2+x3+x4;
    }

    public static void main(String[] args) {
        CompDemo compDemo = new CompDemo();
        //超过方法调用计数器的阈值 100000 次，才会进入 JIT 实时编译，进行内联优化。
        for (int i = 0; i < 1000000; i++) {
            compDemo.add1(1,2,3,4);
        }
    }
}
```

加入 JVM 参数：-XX:+PrintCompilation -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining 后可以看到以下的执行日志

​![image](/assets/img/image-20240325093519-pqvc78u.png)​

当然，发生方法内联的前提是要让这个方法循环足够的次数，成为热点代码。比如，如果将循环次数减少，就看不到方法内联了。

 方法内联的优化本质就是把目标方法的代码原封不动的“复制”到发起调用的方法之中，避免发生真实的方法调用。但是，实际上，Java 虚拟机中的内联过程却远没有想象中那么容易。而且，方法内联往往还是很多后续优化手段的基础。

```java
public class InlineDemo {
    public static void foo(Object obj){
        if(obj !=null){
            System.out.println("do something");
        }
    }
    //方法内联之后会继续进行无用代码消除
    public static void testInline(){
        Object obj= null;
        foo(obj);
    }
    public static void main(String[] args) {
        long l = System.currentTimeMillis();
        for (int i = 0; i < 10000000; i++) {
            testInline();
        }
        System.out.println(">>>>>>>>"+(System.currentTimeMillis()-l));
    }
}
```

单独来看testInline()和foo(obj)是两个单独的方法但是当出现方法内联，将foo(obj)的代码复制到test Inline()中后会发现，if条件永远为false，就是死代码，接下来，JVM虚拟机就可以将DeadCode移除来进行优化

在JDK8中，提供多个跟InLine内联相关参数，可以进行干预内联行为

* -XX:+Inline 启用方法内联。默认开启。
* -XX:InlineSmallCode=size 用来判断是否需要对方法进行内联优化。如果一个方法编译后的字节码大小大于这个值，就无法进行内联。默认值是1000bytes。
* -XX:MaxInlineSize=size 设定内联方法的最大字节数。如果一个方法编译后的字节码大于这个值，则无法进行内联。默认值是35byt
* -XX:FreqInlineSize=size 设定热点方法进行内联的最大字节数。如果一个热点方法编译后的字节码大于这个值，则无法进行内联。默认值是325bytes。
* -XX:MaxTrivialSize=size 设定要进行内联的琐碎方法的最大字节数(Trivial Method：通常指那些只包含一两行语句，并且逻辑非常简单的方法。比如像这样的方法，默认值是6bytes。

```java
public int getTrivialValue() {  
    return 42;  
}
```

* -XX:+PrintInlining 打印内联决策，通过这个指令可以看到哪些方法进行了内联。默认是关闭的。另外，这个参数需要配合`-XX:+UnlockDiagnosticVMOptions` 参数使用。

从这几个相关参数可以看到，我们可以通过以下一些方法提高内联发生的概率。

1 、在编程中，尽量多写小方法，避免写大方法。方法太大不光会导致方法无法内联，另外，成为热点方法后，还会占用更多的CodeCache。

2 、在内存不紧张的情况下，可以通过调整JVM参数，减少热点阈值或增加方法体阈值，让更多的方法可以进行内联。

3 、看情况使用final, private,static关键字修饰方法。方法如果需要继承(也就是需要使用invokevirtual指令调用)，那么具体调用的方法，就只能在运行这一行代码时才能确定，编译器很难在编译时得出绝对正确的结论，也就加大了编译执行的难度。

## 逃逸分析(Escape Analysis)

对象在方法中创建后，如果被方法外部所引用或者作为参数传递给其他方法，这种叫方法逃逸。如果被其他线程访问，譬如作为其他线程可访问对象的属性被引用，就称之为线程逃逸。

```java
private void test1(){
    T t = new T();
    t.setAge(10);
}

private void test2(){
   T t = new T();
    t.setAge(10);
	saveT(t);
}
```

如上方法中，test1方法内的t对象就没有被方法外部引用，因此他不会逃逸，而test2方法中的t就逃逸到其他方法了

如果能保证一个方法不会逃逸出方法或线程，JIT就能针对该对象进行优化

### 标量替换

如果一个对象的属性无法再分解为更小的数据来表示了(java中的int、long、reference类型等)，都不能分解，那么这些变量就可以称为标量。如果把一个java对象拆散，根据程序访问情况，去实际访问拆散后的成员变量，就称之为**标量替换。**

假如逃逸分析能够证明一个对象不会被方法外部访问，并且这个对象可以被拆散，那么程序真正执行的时候将可能不去创建这个对象，而改为直接创建它的若干个被这个方法使用的成员变量来代替。将对象拆分后，除了可以让对象的成员变量在栈上分配和读写之外，还可以为后续进一步的优化手段创建条件。标量替换对逃逸程度的要求更高，它不允许对象逃逸出方法范围内。JDK8 中默认开启了标量替换，可以通过添加参数 `-XX:-EliminateAllocations`​ 主动关闭标量替换。

### 栈上分配

正常情况下，JVM 中所有对象都应该创建在堆上，并由 GC 线程进行回收。如果确定一个对象不会逃逸出线程之外，那让这个对象在栈上分配内存将会是一个很不错的主意，对象所占用的内存空间就可以随栈帧出栈而销毁。在一般应用中，完全不会逃逸的局部对象和不会逃逸出线程的对象所占的比例是很大的，如果能使用栈上分配，那大量的对象就会随着方法的结束而自动销毁了，垃圾收集子系统的压力将会下降很多。栈上分配可以支持方法逃逸，但不能支持线程逃逸。

这三种优化措施中，**逃逸分析**是基础。因为虚拟机栈是对应一个线程的，而堆内存是对应整个Java进程的。如果发生了线程逃逸，那么堆中的同一个对象，可能隶属于多个线程，这时要将堆中的对象挪到虚拟机栈中，那就必须扫描所有的虚拟机栈，检查这个虚拟机栈对应的线程中是否引用了这个对象。这个性能开销是难以接受的。

而栈是一个非常小的内存结构，他也不可能像堆中那么豪横的使用内存空间，所以，也必须要对对象进行最大程度的瘦身，才能放到栈中。而瘦身的方式，就是去掉对象的mark标志位中的补充信息，拆分成最精简的标量。所以，**要开启栈上分配，标量替换也是不可或缺的**。

## 锁消除(lock elision)

这个也是经过逃逸分析后可以直接进行的优化措施。

这个优化措施主要针对synchronized关键字，当JVM检测到一个加锁的代码不会出现锁竞争时，会对这个对象的锁进行锁消除

::: info 场景举例
多线程并发资源竞争是一个很复杂的场景，所以通常想要检查锁是否存在多线程竞争比较困难。
但有一种情况比较简单，如果一个方法没有发生逃逸，那么他内部的锁就不会存在竞争。
:::

```java
public class LockElisionDemo {
    public static String BufferString(String s1,String s2){
        StringBuffer sb = new StringBuffer();
        sb.append(s1);
        sb.append(s2);
        return sb.toString();
    }

    public static String BuilderString(String s1, String s2){
        StringBuilder sb = new StringBuilder();
        sb.append(s1);
        sb.append(s2);
        return sb.toString();
    }

    public static void main(String[] args) {
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < 100000000; i++) {
            BufferString("aaaaa","bbbbbb");
        }
        System.out.println("StringBuffer耗时："+(System.currentTimeMillis()-startTime));

        long startTime2 = System.currentTimeMillis();
        for (int i = 0; i < 100000000; i++) {
            BuilderString("aaaaa","bbbbbb");
        }
        System.out.println("StringBuilder耗时："+(System.currentTimeMillis()-startTime2));
    }
}
```

以上代码分别测试了StringBuffer和StringBuilder的字符串构建方法。两者最大的区别就是StringBuildr是线程不安全的，而StringBuffer是线程安全的，在它的append和toString方法都加了sychronized同步锁，而StringBuilder则没加。

当前代码中，只有一个main线程顺序执行代码，不存在线程竞争，所以这个sychronized没有起作用，因此，在触发了JIT时，JVM会在编译时将这个无用的锁消除掉，这样两个方法耗时是差不多的。

```text
StringBuffer耗时：1521
StringBuilder耗时：1039
```

当使用JVM参数 `-XX:-EliminateLocks`​ 主动关闭锁清除后，执行时间就有比较大的差距

```text
StringBuffer耗时：2461
StringBuilder耗时：1049
```

‍
