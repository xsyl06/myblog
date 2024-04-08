import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as s,c as a,a as t}from"./app-CAXAsVzP.js";const e="/myblog/assets/img/image-20240218230636-wlmtbss.png",p="/myblog/assets/img/image-20240218230623-dlxpbs0.png",o="/myblog/assets/img/image-20240219223511-z8h4pbh.png",l="/myblog/assets/img/image-20240219223524-unjqb0v.png",i="/myblog/assets/img/image-20240219231448-p0uso3p.png",c="/myblog/assets/img/image-20240219234603-i1znmft.png",r="/myblog/assets/img/image-20240220224507-m34vvcx.png",u={},d=t('<h1>03-JVM对象创建及内存分配机制</h1><h1 id="一、对象的创建" tabindex="-1"><a class="header-anchor" href="#一、对象的创建"><span>一、对象的创建</span></a></h1><p>​<img src="'+e+'" alt="image" loading="lazy">​</p><h2 id="_1、类加载检查" tabindex="-1"><a class="header-anchor" href="#_1、类加载检查"><span>1、类加载检查</span></a></h2><p>虚拟机执行new方法指令时，先去检查这个指令的参数是否能够在类的常量池中定位到一个类的符号引用，并检查这个类的符号引用所指向的类是否已加载、解析和初始化过程。如果没有，则执行类加载过程。</p><h2 id="_2、分配内存" tabindex="-1"><a class="header-anchor" href="#_2、分配内存"><span>2、分配内存</span></a></h2><p>对象加载完成过后，虚拟机会对新生对象分配内存操作；对象所需的内存大小，在加载完成便可以确定，为对象分配空间，即JVM将java堆内一部分区域划分给这个对象使用。</p><p><strong>2.1 如何划分：</strong></p><ul><li><strong>指针碰撞：</strong> 如果java内存绝对规整，所有使用过的内存都在一边，则可以使用指针碰撞方法，即左边都是内存，中间是指针作为内存临界标识，所分配内存仅仅是把指针向空闲一边移动所需大小的相等的距离。</li><li><strong>空闲列表：</strong> 当java堆内存并不是规整的，即一部分空闲的和已使用的相互交错，虚拟机会维护一个列表，记录那些内存块可用，在分配时查找一块空间足够的可用内存，分配给这个对象。</li></ul><p><strong>2.2 并发分配时解决办法：</strong></p><ul><li><p><strong>CAS：</strong> 虚拟机采用<strong>CAS+重新分配</strong>方式保证更新时的原子性来保证并发时的内存分配</p></li><li><p><strong>本地线程分配缓冲(Thread Local Allcation Buffer,TLAB):</strong> 在堆内为每个线程划分出一块单独区域，根据线程不同，向该线程的单独区域内进行内存分配。使用-XX:-/+UseTLAB参数来关闭和开启本地线程分配缓冲(JVM默认开启)，-XX:TLABSize来指定缓冲区大小。当无法进行本地线程分配缓冲时，JVM使用CAS方式分配内存。​​</p></li></ul><p>​<img src="'+p+'" alt="image" loading="lazy">​</p><h2 id="_3、初始化零值" tabindex="-1"><a class="header-anchor" href="#_3、初始化零值"><span>3、初始化零值</span></a></h2><p>内存分配完成后，虚拟机需要将分配的空间都初始化为零值(对象头除外)，如int的0值等， 如果使用TLAB，这一步可提前至TLAB分配时进行，这一步操作保证了java里对象实例不赋值默认值也可以直接使用，程序可以访问到这些对象默认的零值。</p><h2 id="_4、设置对象头" tabindex="-1"><a class="header-anchor" href="#_4、设置对象头"><span>4、设置对象头</span></a></h2><p>初始化零值之后，虚拟机需要对对象设置对象头，主要保存对象类的路径(这个对象是那个类)，如何才能找到类的元信息，对象的哈希码，对象GC分代年龄信息等。<br> 在HotSpot虚拟机中，对象在内存中存储的布局可以分为3块区域：对象头（Header）、 实例数据（Instance Data）和对齐填充（Padding）。 HotSpot虚拟机的对象头包括两部分信息，第一部分用于存储对象自身的运行时数据， 如哈希码（HashCode）、GC分代年龄、锁状态标志、线程持有的锁、偏向线程ID、偏向时间戳等。对象头的另外一部分是类型指针，即对象指向它的类元数据的指针，虚拟机通过这个指针来确定这个对象是哪个类的实例。</p><p>​<img src="'+o+'" alt="image" loading="lazy">​</p><p>​<img src="'+l+'" alt="image" loading="lazy">​</p><h2 id="_5、执行-init-方法" tabindex="-1"><a class="header-anchor" href="#_5、执行-init-方法"><span>5、<strong>执行&lt;init&gt;方法</strong></span></a></h2><p>执行init方法，即对象按照程序员意愿进行初始化。即为属性赋值，和执行构造方法。</p><h1 id="二、指针压缩" tabindex="-1"><a class="header-anchor" href="#二、指针压缩"><span>二、指针压缩</span></a></h1><p><strong>-XX:-/+</strong> UseCompressedOops(默认开启)</p><p>在64位系统中，如实际是32位的地址，但使用64位进行存储，相比较32位存储，内存使用会多出1.5倍左右，使用较大指针在主内存和缓存之间移动，占用较大带宽，且GC压力会比较大。</p><p>为了减少在64位平台下的内存消耗，jvm默认启用了指针压缩功能。</p><p>在JVM中32位地址可以支持4G内存(2的32次方)，当内存大于4G时，可以通过对对象指针存入堆内存时压缩编码、取出到cpu寄存器后解码方式进行优化(对象指针在堆中是32位，在寄存器中是35位，2的35次方=32G)，使得jvm只用32位地址就可以支持更大的内存配置(小于等于32G)。</p><p>当堆内存小于4G时，不需要手动启用指针压缩，JVM会默认去掉高位的0，使用低位的32位地址</p><p>当堆内存大于32G时，指针压缩会失效，JVM会强制使用64位(即8字节)来对java对象寻址。</p><p><strong>填充对齐：</strong> 对于大部分处理器，对象以8字节整数倍来对齐填充都是最高效的存取方式。</p><h1 id="三、栈上分配" tabindex="-1"><a class="header-anchor" href="#三、栈上分配"><span>三、栈上分配</span></a></h1><p>​<img src="'+i+'" alt="image" loading="lazy">​</p><h2 id="栈上分配-xx-doescapeanalysis" tabindex="-1"><a class="header-anchor" href="#栈上分配-xx-doescapeanalysis"><span><strong>栈上分配(-XX:-/+DoEscapeAnalysis)</strong></span></a></h2><p>java对象一般在堆上进行分配，当对象没有被引用的时候，需要依靠GC进行回收内存，如果对象数量较多的时候，会给GC带来较大压力，也间接影响了应用的性能。为了减少临时对象在堆内分配的数量，JVM通过逃逸分析确定该对象不会被外部访问。如果不会逃逸可以将该对象在栈上分配内存，这样该对象所占用的内存空间就可以随栈帧出栈而销毁，就减轻了垃圾回收的压力。</p><p><strong>逃逸分析(-XX:-/+EliminateAllocations)：</strong> 就是分析对象动态作用域，当一个对象在方法中被定义后，它可能被外部方法所引用，例如作为调用参数传递到其他地方中，就称之为逃逸，逃逸的对象无法进行栈上分配。</p><p>由于一个线程的栈的大小通常不会太大，虚拟机不会将一个对象完整的分配到栈上，而是使用<strong>标量替换</strong>的方法进，将该对象成员变量分解若干个被这个方法使用的成员变量所代替，这些代替的成员变量在栈帧或寄存器上分配空间，这样就不会因为没有一大块连续空间导致对象内存不够分配。</p><h1 id="四、对象在堆上的分配" tabindex="-1"><a class="header-anchor" href="#四、对象在堆上的分配"><span>四、<strong>对象在堆上的分配</strong></span></a></h1><p>打印GC参数： -XX:+PrintGCDetails</p><h2 id="_1、大对象直接进入老年代" tabindex="-1"><a class="header-anchor" href="#_1、大对象直接进入老年代"><span>1、大对象直接进入老年代</span></a></h2><p>当对象需要大量且连续的空间时，如果新生代的eden区域无法存放，会触发Minor GC，此时大对象在S0和S1区域也无法存储，会直接进入老年代。可通过 -XX:PretenureSizeThreshold参数设置大对象阈值(单位是字节)，<strong>此参数在Serial和ParNew垃圾回收器下起作用</strong>。</p><h2 id="_2、长期存活的对象进入老年代" tabindex="-1"><a class="header-anchor" href="#_2、长期存活的对象进入老年代"><span>2、长期存活的对象进入老年代</span></a></h2><p>虚拟机采用分代的算法进行对象管理和垃圾收集，那么内存回收时就必须能识别哪些对象应放在新生代，哪些对象应放在老年代中。为了做到这一点，虚拟机给每个对象一个对象年龄（Age）计数器。如果对象在 Eden 出生并经过第一次 Minor GC 后仍然能够存活，并且能被 Survivor 容纳的话，将被移动到 Survivor 空间中，并将对象年龄设为1。对象在 Survivor 中每熬过一次 Minor GC，年龄就增加1岁，当它的年龄增加到一定程度（默认为15岁，CMS收集器默认6岁，不同的垃圾收集器会略微有点不同），就会被晋升到老年代中。对象晋升到老年代的年龄阈值，可以通过参数 -XX:MaxTenuringThreshold 来设置。</p><h2 id="_3、对象动态年龄判断" tabindex="-1"><a class="header-anchor" href="#_3、对象动态年龄判断"><span>3、对象动态年龄判断</span></a></h2><p>当前放对象的Survivor区域里(其中一块区域，放对象的那块s区)，一批对象的总大小大于这块Survivor区域内存大小的50%(-XX:TargetSurvivorRatio可以指定)，那么此时<strong>大于等于</strong>这批对象<strong>年龄最大值</strong>的对象，就可以直接进入老年代了，例如Survivor区域里现在有一批对象，年龄1+年龄2+年龄n的多个年龄对象总和超过了Survivor区域的50%，此时就会把年龄n(含)以上的对象都放入老年代。这个规则其实是希望那些可能是长期存活的对象，尽早进入老年代。<strong>对象动态年龄判断机制一般是在Minor GC之后触发的。</strong></p><h2 id="_4、老年代空间担保" tabindex="-1"><a class="header-anchor" href="#_4、老年代空间担保"><span>4、老年代空间担保</span></a></h2><p>年轻代每次Minor GC时，JVM会计算老年代剩余可用空间，如果该空间小于年轻代所有剩余对象之和(包括垃圾对象)</p><p>检查“-XX:-HandlePromotionFailure”(jdk1.8默认就设置了)的参数是否设置</p><p>如果设置了，则会对老年代剩余可用空间大小和之前每一次Minor GC后进入<strong>老年代对象的平均大小</strong>进行比较</p><p>如果是小于或参数未设置，则会触发Full GC，对堆内存进行回收，如果回收完还没有足够的空间，则报OOM</p><p>如果比对结果为大于，但Minor GC之后需要存放到老年代的对象大小仍然超过了老年代剩余可用空间大小，也会触发Full GC，对堆内存进行回收，如果回收完还没有足够的空间，则报OOM</p><p>​<img src="'+c+`" alt="image" loading="lazy">​</p><h1 id="五、对象内存回收" tabindex="-1"><a class="header-anchor" href="#五、对象内存回收"><span>五、<strong>对象内存回收</strong></span></a></h1><p>堆中几乎放着所有的对象实例，对堆垃圾回收前的第一步就是要判断哪些对象已经死亡（即不能再被任何途径使用的对象）。</p><h2 id="引用计数" tabindex="-1"><a class="header-anchor" href="#引用计数"><span>引用计数</span></a></h2><p>可以给对象添加一个引用计数，如果该对象被引用，则计数加1，如果没有被引用，则计数减1，任何计数为0的对象就是可回收对象。<br><strong>这个方法实现简单，效率高，但是目前主流的虚拟机中并没有选择这个算法来管理内存，其最主要的原因是它很难解决对象之间相互循环引用的问题。</strong> 所谓对象之间的相互引用问题，如下面代码所示：除了对象objA 和 objB 相互引用着对方之外，这两个对象之间再无任何引用。但是他们因为互相引用对方，导致它们的引用计数器都不为0，于是引用计数算法无法通知 GC 回收器回收他们。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">class</span> <span class="token class-name">A</span><span class="token punctuation">{</span>
	<span class="token keyword">public</span> <span class="token class-name">B</span> b<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">class</span> <span class="token class-name">B</span><span class="token punctuation">{</span>
	<span class="token keyword">public</span> <span class="token class-name">A</span> a<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
	<span class="token class-name">A</span> a <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">A</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token class-name">B</span> a <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">B</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	a<span class="token punctuation">.</span>b <span class="token operator">=</span> b<span class="token punctuation">;</span>
	b<span class="token punctuation">.</span>a <span class="token operator">=</span> a<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="可达性分析" tabindex="-1"><a class="header-anchor" href="#可达性分析"><span>可达性分析</span></a></h2><p>将 <strong>“GC Roots”</strong> 对象作为起点，从这些节点开始向下搜索引用的对象，找到的对象都标记为<strong>非垃圾对象，</strong> 其余未标记的对象都是垃圾对象</p><p><strong>GC Roots</strong>根节点：<strong>线程栈的本地变量</strong>、静态变量、本地方法栈的变量等等</p><p>​<img src="`+r+`" alt="image" loading="lazy">​</p><h3 id="常见引用类型" tabindex="-1"><a class="header-anchor" href="#常见引用类型"><span><strong>常见引用类型</strong></span></a></h3><p>java的引用类型一般分为四种：<strong>强引用、软引用、弱引用、虚引用</strong></p><p><strong>强引用：</strong> 普通的变量引用</p><p>​<code>public static User user = new User();</code>​</p><p><strong>软引用：</strong> 将对象用SoftReference软引用类型的对象包裹，正常情况不会被回收，但是GC做完后发现释放不出空间存放新的对象，则会把这些软引用的对象回收掉。<strong>软引用可用来实现内存敏感的高速缓存</strong>。</p><p>​<code>public static SoftReference&lt;User&gt; user = new SoftReference&lt;User&gt;(new User()); </code>​</p><p>软引用在实际中有重要的应用，例如浏览器的后退按钮。按后退时，这个后退时显示的网页内容是重新进行请求还是从缓存中取出呢？这就要看具体的实现策略了。</p><p>​（1）如果一个网页在浏览结束时就进行内容的回收，则按后退查看前面浏览过的页面时，需要重新构建</p><p>（2）如果将浏览过的网页存储到内存中会造成内存的大量浪费，甚至会造成内存溢出</p><p><strong>弱引用：</strong> 将对象用WeakReference软引用类型的对象包裹，弱引用跟没引用差不多，GC会直接回收掉，很少用</p><p>​<code>public static WeakReference&lt;User&gt; user = new WeakReference&lt;User&gt;(new User()); </code>​</p><p><strong>虚引用：</strong> 虚引用也称为幽灵引用或者幻影引用，它是最弱的一种引用关系，几乎不用</p><h3 id="finalize-方法最终判定对象是否存活" tabindex="-1"><a class="header-anchor" href="#finalize-方法最终判定对象是否存活"><span><strong>finalize()方法最终判定对象是否存活</strong></span></a></h3><p>即使在可达性分析算法中不可达的对象，也并非是“非死不可”的，这时候它们暂时处于“缓刑”阶段，要真正宣告一个对象死亡，至少要经历再次标记过程。</p><p><strong>标记的前提是对象在进行可达性分析后发现没有与GC Roots相连接的引用链。</strong></p><p><strong>1. 第一次标记并进行一次筛选。</strong><br> 筛选的条件是此对象是否有必要执行finalize()方法。<br> 当对象没有覆盖finalize方法，对象将直接被回收。</p><p><strong>2. 第二次标记</strong><br> 如果这个对象覆盖了finalize方法，finalize方法是对象脱逃死亡命运的最后一次机会，如果对象要在finalize()中成功拯救自己，只要重新与引用链上的任何的一个对象建立关联即可，譬如把自己赋值给某个类变量或对象的成员变量，那在第二次标记时它将移除出“即将回收”的集合。如果对象这时候还没逃脱，那基本上它就真的被回收了。</p><p><strong>注意：一个对象的finalize()方法只会被执行一次，也就是说通过调用finalize方法自我救命的机会就一次。</strong></p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">OOMTest</span> <span class="token punctuation">{</span>

   <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span> list <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ArrayList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
      <span class="token keyword">int</span> j <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
      <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
         list<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">User</span><span class="token punctuation">(</span>i<span class="token operator">++</span><span class="token punctuation">,</span> <span class="token constant">UUID</span><span class="token punctuation">.</span><span class="token function">randomUUID</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
         <span class="token keyword">new</span> <span class="token class-name">User</span><span class="token punctuation">(</span>j<span class="token operator">--</span><span class="token punctuation">,</span> <span class="token constant">UUID</span><span class="token punctuation">.</span><span class="token function">randomUUID</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
   <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
<span class="token comment">//User类需要重写finalize方法</span>
<span class="token annotation punctuation">@Override</span>
<span class="token keyword">protected</span> <span class="token keyword">void</span> <span class="token function">finalize</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">Throwable</span> <span class="token punctuation">{</span>
    <span class="token class-name">OOMTest</span><span class="token punctuation">.</span>list<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;关闭资源，userid=&quot;</span> <span class="token operator">+</span> id <span class="token operator">+</span> <span class="token string">&quot;即将被回收&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="如何判断一个类是无用的类" tabindex="-1"><a class="header-anchor" href="#如何判断一个类是无用的类"><span><strong>如何判断一个类是无用的类</strong></span></a></h2><p>方法区主要回收的是无用的类，那么如何判断一个类是无用的类呢？<br> 类需要同时满足下面3个条件才能算是 <strong>“无用的类”</strong> ：</p><ul><li>该类所有的对象实例都已经被回收，也就是 Java 堆中不存在该类的任何实例。</li><li>加载该类的 ClassLoader 已经被回收。</li><li>该类对应的 java.lang.Class 对象没有在任何地方被引用，无法在任何地方通过反射访问该类的方法。</li></ul><p>‍</p>`,81),g=[d];function k(m,h){return s(),a("div",null,g)}const y=n(u,[["render",k],["__file","03-JVM对象创建及内存分配机制.html.vue"]]),_=JSON.parse('{"path":"/statudy/JVM/03-JVM%E5%AF%B9%E8%B1%A1%E5%88%9B%E5%BB%BA%E5%8F%8A%E5%86%85%E5%AD%98%E5%88%86%E9%85%8D%E6%9C%BA%E5%88%B6.html","title":"03-JVM对象创建及内存分配机制","lang":"zh-CN","frontmatter":{"title":"03-JVM对象创建及内存分配机制","order":3,"date":"2024-03-31T00:00:00.000Z","category":["JVM"],"tag":["JVM"],"description":"03-JVM对象创建及内存分配机制 一、对象的创建 ​image​ 1、类加载检查 虚拟机执行new方法指令时，先去检查这个指令的参数是否能够在类的常量池中定位到一个类的符号引用，并检查这个类的符号引用所指向的类是否已加载、解析和初始化过程。如果没有，则执行类加载过程。 2、分配内存 对象加载完成过后，虚拟机会对新生对象分配内存操作；对象所需的内存大小...","head":[["meta",{"property":"og:url","content":"https://xsyl06.github.io/xsyl06/myblog/statudy/JVM/03-JVM%E5%AF%B9%E8%B1%A1%E5%88%9B%E5%BB%BA%E5%8F%8A%E5%86%85%E5%AD%98%E5%88%86%E9%85%8D%E6%9C%BA%E5%88%B6.html"}],["meta",{"property":"og:site_name","content":"Xsyl06的博客"}],["meta",{"property":"og:title","content":"03-JVM对象创建及内存分配机制"}],["meta",{"property":"og:description","content":"03-JVM对象创建及内存分配机制 一、对象的创建 ​image​ 1、类加载检查 虚拟机执行new方法指令时，先去检查这个指令的参数是否能够在类的常量池中定位到一个类的符号引用，并检查这个类的符号引用所指向的类是否已加载、解析和初始化过程。如果没有，则执行类加载过程。 2、分配内存 对象加载完成过后，虚拟机会对新生对象分配内存操作；对象所需的内存大小..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://xsyl06.github.io/xsyl06/myblog/assets/img/image-20240218230636-wlmtbss.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-08T09:26:37.000Z"}],["meta",{"property":"article:author","content":"xsyl06"}],["meta",{"property":"article:tag","content":"JVM"}],["meta",{"property":"article:published_time","content":"2024-03-31T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-04-08T09:26:37.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"03-JVM对象创建及内存分配机制\\",\\"image\\":[\\"https://xsyl06.github.io/xsyl06/myblog/assets/img/image-20240218230636-wlmtbss.png\\",\\"https://xsyl06.github.io/xsyl06/myblog/assets/img/image-20240218230623-dlxpbs0.png\\",\\"https://xsyl06.github.io/xsyl06/myblog/assets/img/image-20240219223511-z8h4pbh.png\\",\\"https://xsyl06.github.io/xsyl06/myblog/assets/img/image-20240219223524-unjqb0v.png\\",\\"https://xsyl06.github.io/xsyl06/myblog/assets/img/image-20240219231448-p0uso3p.png\\",\\"https://xsyl06.github.io/xsyl06/myblog/assets/img/image-20240219234603-i1znmft.png\\",\\"https://xsyl06.github.io/xsyl06/myblog/assets/img/image-20240220224507-m34vvcx.png\\"],\\"datePublished\\":\\"2024-03-31T00:00:00.000Z\\",\\"dateModified\\":\\"2024-04-08T09:26:37.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"xsyl06\\",\\"url\\":\\"https://gitee.com/xsyl06\\"}]}"]]},"headers":[{"level":1,"title":"一、对象的创建","slug":"一、对象的创建","link":"#一、对象的创建","children":[{"level":2,"title":"1、类加载检查","slug":"_1、类加载检查","link":"#_1、类加载检查","children":[]},{"level":2,"title":"2、分配内存","slug":"_2、分配内存","link":"#_2、分配内存","children":[]},{"level":2,"title":"3、初始化零值","slug":"_3、初始化零值","link":"#_3、初始化零值","children":[]},{"level":2,"title":"4、设置对象头","slug":"_4、设置对象头","link":"#_4、设置对象头","children":[]},{"level":2,"title":"5、执行<init>方法","slug":"_5、执行-init-方法","link":"#_5、执行-init-方法","children":[]}]},{"level":1,"title":"二、指针压缩","slug":"二、指针压缩","link":"#二、指针压缩","children":[]},{"level":1,"title":"三、栈上分配","slug":"三、栈上分配","link":"#三、栈上分配","children":[{"level":2,"title":"栈上分配(-XX:-/+DoEscapeAnalysis)","slug":"栈上分配-xx-doescapeanalysis","link":"#栈上分配-xx-doescapeanalysis","children":[]}]},{"level":1,"title":"四、对象在堆上的分配","slug":"四、对象在堆上的分配","link":"#四、对象在堆上的分配","children":[{"level":2,"title":"1、大对象直接进入老年代","slug":"_1、大对象直接进入老年代","link":"#_1、大对象直接进入老年代","children":[]},{"level":2,"title":"2、长期存活的对象进入老年代","slug":"_2、长期存活的对象进入老年代","link":"#_2、长期存活的对象进入老年代","children":[]},{"level":2,"title":"3、对象动态年龄判断","slug":"_3、对象动态年龄判断","link":"#_3、对象动态年龄判断","children":[]},{"level":2,"title":"4、老年代空间担保","slug":"_4、老年代空间担保","link":"#_4、老年代空间担保","children":[]}]},{"level":1,"title":"五、对象内存回收","slug":"五、对象内存回收","link":"#五、对象内存回收","children":[{"level":2,"title":"引用计数","slug":"引用计数","link":"#引用计数","children":[]},{"level":2,"title":"可达性分析","slug":"可达性分析","link":"#可达性分析","children":[{"level":3,"title":"常见引用类型","slug":"常见引用类型","link":"#常见引用类型","children":[]},{"level":3,"title":"finalize()方法最终判定对象是否存活","slug":"finalize-方法最终判定对象是否存活","link":"#finalize-方法最终判定对象是否存活","children":[]}]},{"level":2,"title":"如何判断一个类是无用的类","slug":"如何判断一个类是无用的类","link":"#如何判断一个类是无用的类","children":[]}]}],"git":{"createdTime":1712568397000,"updatedTime":1712568397000,"contributors":[{"name":"Wang","email":"xsyl06@qq.com","commits":1}]},"readingTime":{"minutes":12.28,"words":3683},"filePathRelative":"statudy/JVM/03-JVM对象创建及内存分配机制.md","localizedDate":"2024年3月31日","excerpt":"\\n<h1>一、对象的创建</h1>\\n<p>​<img src=\\"/assets/img/image-20240218230636-wlmtbss.png\\" alt=\\"image\\" loading=\\"lazy\\">​</p>\\n<h2>1、类加载检查</h2>\\n<p>虚拟机执行new方法指令时，先去检查这个指令的参数是否能够在类的常量池中定位到一个类的符号引用，并检查这个类的符号引用所指向的类是否已加载、解析和初始化过程。如果没有，则执行类加载过程。</p>\\n<h2>2、分配内存</h2>\\n<p>对象加载完成过后，虚拟机会对新生对象分配内存操作；对象所需的内存大小，在加载完成便可以确定，为对象分配空间，即JVM将java堆内一部分区域划分给这个对象使用。</p>","autoDesc":true}');export{y as comp,_ as data};
