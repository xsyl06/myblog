import{_ as e}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as t,o as p,c as i,d as n,e as l,b as c,a as s}from"./app-D_MdSpv0.js";const o="/myblog/assets/img/image-20240409100437-7lnjn47.png",u="/myblog/assets/img/image-20240409100609-pow9146.png",d="/myblog/assets/img/image-20240409103825-aqwateh.png",r="/myblog/assets/img/image-20240409111335-nx778bd.png",m="/myblog/assets/img/image-20240409111423-cj1c3cc.png",k="/myblog/assets/img/image-20240410112715-v41surk.png",g="/myblog/assets/img/net-img-1658140090631-f548d54b-2576-4561-9ecd-8345d22d71c3-20240410112951-7pmfewp.png",v="/myblog/assets/img/image-20240410112942-16zawla.png",h="/myblog/assets/img/image-20240410141141-8vb6b06.png",b="/myblog/assets/img/image-20240410141316-cazuqpo.png",y="/myblog/assets/img/image-20240410141409-dm80u2g.png",j={},f=s(`<h2 id="前置启动程序" tabindex="-1"><a class="header-anchor" href="#前置启动程序"><span>前置启动程序</span></a></h2><p>事先启动一个web程序，使用jps查看其进程id，接着可以使用各种java提供的工具排查、优化应用</p><h2 id="jmap" tabindex="-1"><a class="header-anchor" href="#jmap"><span>jmap</span></a></h2><p>此命令能查看内存信息，实例个数及占用内存大小。</p><h3 id="jmap-histo" tabindex="-1"><a class="header-anchor" href="#jmap-histo"><span>jmap -histo</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#查看历史生成的实例</span>
jmap <span class="token parameter variable">-histo</span> pid

<span class="token comment">#查看当前存活的实例，执行过程中可能会触发一次fullGC</span>
jmap <span class="token parameter variable">-histo:live</span> pid
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>​<img src="`+o+'" alt="image">​</p><p>​<img src="'+u+`" alt="image">​</p><ul><li>num：序号</li><li>instances：实例数量</li><li>bytes：占用空间大小</li><li>class name：类名称，[C is a char[]，[S is a short[]，[I is a int[]，[B is a byte[]，[[I is a int[][]</li></ul><h3 id="jmap-heap" tabindex="-1"><a class="header-anchor" href="#jmap-heap"><span>jmap -heap</span></a></h3><p>查看堆信息</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#JDK8查看堆内存信息</span>
jmap <span class="token parameter variable">-heap</span> pid
<span class="token comment">#JDK17查看堆内存信息</span>
jhsdb jmap <span class="token parameter variable">--heap</span> <span class="token parameter variable">--pid</span> pid
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>​<img src="`+d+`" alt="image">​</p><h3 id="导出堆内对象信息" tabindex="-1"><a class="header-anchor" href="#导出堆内对象信息"><span>导出堆内对象信息</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#导出堆内对象信息到文件</span>
 jmap <span class="token parameter variable">-dump:format</span><span class="token operator">=</span>b,file<span class="token operator">=</span>dump.hprof pid
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>也可以设置内存溢出自动导出dump文件(内存很大的时候，可能会导不出来)</p><ol><li>-XX:+HeapDumpOnOutOfMemoryError</li><li>-XX:HeapDumpPath=./ （路径）</li></ol><p>导出文件后，可通过jvisualvm命令工具导入该hprof文件分析</p>`,18),w={class:"hint-container note"},x=n("p",{class:"hint-container-title"},"idea分析堆文件",-1),_=n("p",null,"idea中通过View->Tool Windows->Profiler打开分析界面，在界面右方点击打开本地的hprof文件进行分析，如果同时打开了对应的工程，还可直接检测到这个类的哪一行不断产生大对象导致堆溢出",-1),C={href:"https://blog.csdn.net/weixin_43982359/article/details/132316552",target:"_blank",rel:"noopener noreferrer"},M=s(`<h2 id="jstack" tabindex="-1"><a class="header-anchor" href="#jstack"><span>jstack</span></a></h2><p>栈信息，可通过该命令查找死锁</p><h3 id="jstack-pid" tabindex="-1"><a class="header-anchor" href="#jstack-pid"><span>jstack pid</span></a></h3><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DeadLockTest</span> <span class="token punctuation">{</span>

   <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token class-name">Object</span> lock1 <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Object</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
   <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token class-name">Object</span> lock2 <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Object</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

   <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">new</span> <span class="token class-name">Thread</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
         <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock1<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">try</span> <span class="token punctuation">{</span>
               <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;thread1 begin&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
               <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">sleep</span><span class="token punctuation">(</span><span class="token number">5000</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock2<span class="token punctuation">)</span> <span class="token punctuation">{</span>
               <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;thread1 end&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
         <span class="token punctuation">}</span>
      <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

      <span class="token keyword">new</span> <span class="token class-name">Thread</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
         <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock2<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">try</span> <span class="token punctuation">{</span>
               <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;thread2 begin&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
               <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">sleep</span><span class="token punctuation">(</span><span class="token number">5000</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock1<span class="token punctuation">)</span> <span class="token punctuation">{</span>
               <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;thread2 end&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
         <span class="token punctuation">}</span>
      <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

      <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;main thread end&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
   <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>​<img src="`+r+'" alt="image">​</p><ul><li>&quot;Thread-1&quot; 线程名</li><li>prio=5 优先级=5​</li><li>tid=0x000000001fa9e000 线程id​</li><li>nid=0x2d64 线程对应的本地线程标识nid​</li><li>java.lang.Thread.State: BLOCKED 线程状态</li></ul><p>​<img src="'+m+'" alt="image">​</p><p>还可以用jvisualvm自动检测死锁</p><p>​<img src="'+k+`" alt="image">​</p><h3 id="jstack找出占用cpu最高的线程" tabindex="-1"><a class="header-anchor" href="#jstack找出占用cpu最高的线程"><span>jstack找出占用CPU最高的线程</span></a></h3><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">com<span class="token punctuation">.</span>tuling<span class="token punctuation">.</span>jvm</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * 运行此代码，cpu会飙高
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Math</span> <span class="token punctuation">{</span>

    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> initData <span class="token operator">=</span> <span class="token number">666</span><span class="token punctuation">;</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">User</span> user <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">User</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">compute</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>  <span class="token comment">//一个方法对应一块栈帧内存区域</span>
        <span class="token keyword">int</span> a <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
        <span class="token keyword">int</span> b <span class="token operator">=</span> <span class="token number">2</span><span class="token punctuation">;</span>
        <span class="token keyword">int</span> c <span class="token operator">=</span> <span class="token punctuation">(</span>a <span class="token operator">+</span> b<span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">10</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> c<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Math</span> math <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Math</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
            math<span class="token punctuation">.</span><span class="token function">compute</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol><li>使用命令<code>top -p pid</code>​显示你的java进程内存情况</li></ol><p>​<img src="`+g+'" alt="1658140090631-f548d54b-2576-4561-9ecd-8345d22d71c3">​</p><ol start="2"><li>大写H，展示进程中的线程ID</li></ol><p>​<img src="'+v+'" alt="image">​</p><ol start="3"><li>找到内存和CPU占用较高的tid比如19664</li><li>通过printf &quot;%x&quot; pid 转换为十六进制得到0x4cd0，此为线程的十六进制表示</li><li>执行jstack 19663 |grep -A 10 4cd0得到线程堆栈信息中4cd0的这个线程号后面10行的信息，从堆栈信息中cpu飙高的代码行信息</li></ol><p>​<img src="'+h+'" alt="image">​</p><ol start="6"><li>查看对应的堆栈信息找出可能存在问题的代码</li></ol><h2 id="jinfo" tabindex="-1"><a class="header-anchor" href="#jinfo"><span>jinfo</span></a></h2><p>查看正在运行的java的运行参数</p><h3 id="jinfo-flags-pid" tabindex="-1"><a class="header-anchor" href="#jinfo-flags-pid"><span>jinfo -flags pid</span></a></h3><p>查看java参数</p><p>​<img src="'+b+'" alt="image">​</p><h3 id="jinfo-sysprops-pid" tabindex="-1"><a class="header-anchor" href="#jinfo-sysprops-pid"><span>jinfo -sysprops pid</span></a></h3><p>查看java系统参数</p><p>​<img src="'+y+`" alt="image">​</p><h2 id="jstat" tabindex="-1"><a class="header-anchor" href="#jstat"><span>jstat</span></a></h2><p>jstat命令可以查看堆内存各部分的使用量，以及加载类的数量。命令的格式如下：</p><p>jdk8：jstat [-命令选项] [vmid] [间隔时间(毫秒)] [查询次数]</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#命令选项</span>
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="jvm运行情况预估" tabindex="-1"><a class="header-anchor" href="#jvm运行情况预估"><span>JVM<strong>运行情况预估</strong></span></a></h3><p>用 jstat gc -pid 命令可以计算出如下一些关键数据，有了这些数据就可以采用之前介绍过的优化思路，先给自己的系统设置一些初始性的JVM参数，比如堆内存大小，年轻代大小，Eden和Survivor的比例，老年代的大小，大对象的阈值，大龄对象进入老年代的阈值等。</p><h4 id="年轻代对象增长的速率" tabindex="-1"><a class="header-anchor" href="#年轻代对象增长的速率"><span><strong>年轻代对象增长的速率</strong></span></a></h4><p>可以执行命令 jstat -gc pid 1000 10 (每隔1秒执行1次命令，共执行10次)，通过观察EU(eden区的使用)来估算每秒eden大概新增多少对象，如果系统负载不高，可以把频率1秒换成1分钟，甚至10分钟来观察整体情况。注意，一般系统可能有高峰期和日常期，所以需要在不同的时间分别估算不同情况下对象增长速率。</p><h4 id="young-gc的触发频率和每次耗时" tabindex="-1"><a class="header-anchor" href="#young-gc的触发频率和每次耗时"><span><strong>Young GC的触发频率和每次耗时</strong></span></a></h4><p>知道年轻代对象增长速率我们就能推根据eden区的大小推算出Young GC大概多久触发一次，Young GC的平均耗时可以通过 YGCT/YGC 公式算出，根据结果我们大概就能知道系统大概多久会因为Young GC的执行而卡顿多久。</p><h4 id="每次young-gc后有多少对象存活和进入老年代" tabindex="-1"><a class="header-anchor" href="#每次young-gc后有多少对象存活和进入老年代"><span><strong>每次Young GC后有多少对象存活和进入老年代</strong></span></a></h4><p>这个因为之前已经大概知道Young GC的频率，假设是每5分钟一次，那么可以执行命令 jstat -gc pid 300000 10 ，观察每次结果eden，survivor和老年代使用的变化情况，在每次gc后eden区使用一般会大幅减少，survivor和老年代都有可能增长，这些增长的对象就是每次Young GC后存活的对象，同时还可以看出每次Young GC后进去老年代大概多少对象，从而可以推算出老年代对象增长速率。</p><h4 id="full-gc的触发频率和每次耗时" tabindex="-1"><a class="header-anchor" href="#full-gc的触发频率和每次耗时"><span><strong>Full GC的触发频率和每次耗时</strong></span></a></h4><p>知道了老年代对象的增长速率就可以推算出Full GC的触发频率了，Full GC的每次耗时可以用公式 FGCT/FGC 计算得出。</p><h4 id="优化思路" tabindex="-1"><a class="header-anchor" href="#优化思路"><span><strong>优化思路</strong></span></a></h4><p>其实简单来说就是尽量让每次Young GC后的存活对象小于Survivor区域的50%，都留存在年轻代里。尽量别让对象进入老年代。尽量减少Full GC的频率，避免频繁Full GC对JVM性能的影响。</p><h2 id="内存泄漏的一些事" tabindex="-1"><a class="header-anchor" href="#内存泄漏的一些事"><span>内存泄漏的一些事</span></a></h2><p>一般电商架构可能会使用多级缓存架构，就是redis加上JVM级缓存，大多数同学可能为了图方便对于JVM级缓存就简单使用一个hashmap，于是不断往里面放缓存数据，但是很少考虑这个map的容量问题，结果这个缓存map越来越大，一直占用着老年代的很多空间，时间长了就会导致full gc非常频繁，这就是一种内存泄漏，对于一些老旧数据没有及时清理导致一直占用着宝贵的内存资源，时间长了除了导致full gc，还有可能导致OOM。</p><p>这种情况完全可以考虑采用一些成熟的JVM级缓存框架来解决，比如ehcache等自带一些LRU数据淘汰算法的框架来作为JVM级的缓存。</p><p>‍</p>`,46);function J(V,G){const a=t("ExternalLinkIcon");return p(),i("div",null,[f,n("div",w,[x,_,n("p",null,[n("a",C,[l("jvm内存溢出排查（使用idea自带的内存泄漏分析工具)_idea jvm内存分析工具-CSDN博客"),c(a)])])]),M])}const E=e(j,[["render",J],["__file","06-JVM工具详解.html.vue"]]),S=JSON.parse('{"path":"/statudy/JVM/06-JVM%E5%B7%A5%E5%85%B7%E8%AF%A6%E8%A7%A3.html","title":"06-JVM工具详解","lang":"zh-CN","frontmatter":{"title":"06-JVM工具详解","order":6,"date":"2024-04-10T00:00:00.000Z","category":["JVM"],"tag":["JVM"],"description":"前置启动程序 事先启动一个web程序，使用jps查看其进程id，接着可以使用各种java提供的工具排查、优化应用 jmap 此命令能查看内存信息，实例个数及占用内存大小。 jmap -histo ​image​ ​image​ num：序号 instances：实例数量 bytes：占用空间大小 class name：类名称，[C is a char[...","head":[["meta",{"property":"og:url","content":"https://xsyl06.github.io/myblog/myblog/statudy/JVM/06-JVM%E5%B7%A5%E5%85%B7%E8%AF%A6%E8%A7%A3.html"}],["meta",{"property":"og:site_name","content":"Xsyl06的博客"}],["meta",{"property":"og:title","content":"06-JVM工具详解"}],["meta",{"property":"og:description","content":"前置启动程序 事先启动一个web程序，使用jps查看其进程id，接着可以使用各种java提供的工具排查、优化应用 jmap 此命令能查看内存信息，实例个数及占用内存大小。 jmap -histo ​image​ ​image​ num：序号 instances：实例数量 bytes：占用空间大小 class name：类名称，[C is a char[..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240409100437-7lnjn47.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-10T07:37:02.000Z"}],["meta",{"property":"article:author","content":"xsyl06"}],["meta",{"property":"article:tag","content":"JVM"}],["meta",{"property":"article:published_time","content":"2024-04-10T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-04-10T07:37:02.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"06-JVM工具详解\\",\\"image\\":[\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240409100437-7lnjn47.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240409100609-pow9146.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240409103825-aqwateh.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240409111335-nx778bd.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240409111423-cj1c3cc.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240410112715-v41surk.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/net-img-1658140090631-f548d54b-2576-4561-9ecd-8345d22d71c3-20240410112951-7pmfewp.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240410112942-16zawla.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240410141141-8vb6b06.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240410141316-cazuqpo.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240410141409-dm80u2g.png\\"],\\"datePublished\\":\\"2024-04-10T00:00:00.000Z\\",\\"dateModified\\":\\"2024-04-10T07:37:02.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"xsyl06\\",\\"url\\":\\"https://gitee.com/xsyl06\\"}]}"]]},"headers":[{"level":2,"title":"前置启动程序","slug":"前置启动程序","link":"#前置启动程序","children":[]},{"level":2,"title":"jmap","slug":"jmap","link":"#jmap","children":[{"level":3,"title":"jmap -histo","slug":"jmap-histo","link":"#jmap-histo","children":[]},{"level":3,"title":"jmap -heap","slug":"jmap-heap","link":"#jmap-heap","children":[]},{"level":3,"title":"导出堆内对象信息","slug":"导出堆内对象信息","link":"#导出堆内对象信息","children":[]}]},{"level":2,"title":"jstack","slug":"jstack","link":"#jstack","children":[{"level":3,"title":"jstack pid","slug":"jstack-pid","link":"#jstack-pid","children":[]},{"level":3,"title":"jstack找出占用CPU最高的线程","slug":"jstack找出占用cpu最高的线程","link":"#jstack找出占用cpu最高的线程","children":[]}]},{"level":2,"title":"jinfo","slug":"jinfo","link":"#jinfo","children":[{"level":3,"title":"jinfo -flags pid","slug":"jinfo-flags-pid","link":"#jinfo-flags-pid","children":[]},{"level":3,"title":"jinfo -sysprops pid","slug":"jinfo-sysprops-pid","link":"#jinfo-sysprops-pid","children":[]}]},{"level":2,"title":"jstat","slug":"jstat","link":"#jstat","children":[{"level":3,"title":"JVM运行情况预估","slug":"jvm运行情况预估","link":"#jvm运行情况预估","children":[{"level":4,"title":"年轻代对象增长的速率","slug":"年轻代对象增长的速率","link":"#年轻代对象增长的速率","children":[]},{"level":4,"title":"Young GC的触发频率和每次耗时","slug":"young-gc的触发频率和每次耗时","link":"#young-gc的触发频率和每次耗时","children":[]},{"level":4,"title":"每次Young GC后有多少对象存活和进入老年代","slug":"每次young-gc后有多少对象存活和进入老年代","link":"#每次young-gc后有多少对象存活和进入老年代","children":[]},{"level":4,"title":"Full GC的触发频率和每次耗时","slug":"full-gc的触发频率和每次耗时","link":"#full-gc的触发频率和每次耗时","children":[]},{"level":4,"title":"优化思路","slug":"优化思路","link":"#优化思路","children":[]}]}]},{"level":2,"title":"内存泄漏的一些事","slug":"内存泄漏的一些事","link":"#内存泄漏的一些事","children":[]}],"git":{"createdTime":1712734622000,"updatedTime":1712734622000,"contributors":[{"name":"Wang","email":"xsyl06@qq.com","commits":1}]},"readingTime":{"minutes":6.61,"words":1983},"filePathRelative":"statudy/JVM/06-JVM工具详解.md","localizedDate":"2024年4月10日","excerpt":"<h2>前置启动程序</h2>\\n<p>事先启动一个web程序，使用jps查看其进程id，接着可以使用各种java提供的工具排查、优化应用</p>\\n<h2>jmap</h2>\\n<p>此命令能查看内存信息，实例个数及占用内存大小。</p>\\n<h3>jmap -histo</h3>\\n<div class=\\"language-bash\\" data-ext=\\"sh\\" data-title=\\"sh\\"><pre class=\\"language-bash\\"><code><span class=\\"token comment\\">#查看历史生成的实例</span>\\njmap <span class=\\"token parameter variable\\">-histo</span> pid\\n\\n<span class=\\"token comment\\">#查看当前存活的实例，执行过程中可能会触发一次fullGC</span>\\njmap <span class=\\"token parameter variable\\">-histo:live</span> pid\\n</code></pre></div>","autoDesc":true}');export{E as comp,S as data};
