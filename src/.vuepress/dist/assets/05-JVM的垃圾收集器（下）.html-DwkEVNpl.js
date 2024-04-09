import{_ as l}from"./image-20240221224025-ip60b66-CayMTXT0.js";import{_ as s}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as a,o as r,c as g,d as e,e as i,b as o,a as t}from"./app-D6Ltcm7O.js";const p="/myblog/assets/img/image-20240328144128-wi4y9gk.png",c="/myblog/assets/img/image-20240328144147-ok38h8z.png",h="/myblog/assets/img/image-20240328162347-reb22tz.png",d="/myblog/assets/img/image-20240401225915-83cdy4d.png",G="/myblog/assets/img/network-asset-1658138759528-3d9e4c26-0ec5-4022-bb65-8872869f703d-20240407102751-s2yu49s.png",m="/myblog/assets/img/image-20240407105001-l22i6rl.png",u="/myblog/assets/img/image-20240407173719-4o4ztyi.png",C="/myblog/assets/img/image-20240408111211-klxqkoo.png",M="/myblog/assets/img/image-20240408111331-3fhepwd.png",b="/myblog/assets/img/image-20240408111725-omdfhgv.png",_={},y=t('<h2 id="g1垃圾收集器-xx-useg1gc" tabindex="-1"><a class="header-anchor" href="#g1垃圾收集器-xx-useg1gc"><span>G1垃圾收集器(-XX:+UseG1GC)</span></a></h2><p>G1 (Garbage-First)是一款面向服务器的垃圾收集器,主要针对配备多颗处理器及大容量内存的机器. 以极高概率满足GC停顿时间要求的同时,还具备高吞吐量性能特征.</p><p>​<img src="'+p+'" alt="image">​</p><p>​<img src="'+c+'" alt="image">​</p><p>G1将Java堆划分为多个大小相等的独立区域（Region），JVM目标是不超过2048个Region(JVM源码里TARGET_REGION_NUMBER 定义)，实际可以超过该值，但是不推荐。<br> 一般Region大小等于堆大小除以2048，比如堆大小为4096M，则Region大小为2M，当然也可以用参数<code>-XX:G1HeapRegionSize</code>​手动指定Region大小，但是推荐默认的计算方式。</p><p>G1保留了年轻代和老年代的概念，但不再是物理隔离了，他们都是(相同性质的堆可以不连续)Region的集合<br> 默认年轻代占5%，如果堆大小为4096M，那么年轻代就是200M左右内存，对应大概是100个Region，可以通过<code>-XX:G1NewSizePercent</code>设置新生代初始占比。在系统运行中，JVM会不停的给年轻代增加更多的Region，但是最多新生代的占比不会超过60%，可以通过<code>-XX:G1MaxNewSizePercent</code>​调整。年轻代中的Eden和Survivor对应的region也跟之前一样，默认8:1:1，假设年轻代现在有1000个region，eden区对应800个，s0对应100个，s1对应100个。</p><p><strong>一个Region可能之前是年轻代，如果Region进行了垃圾回收，之后可能又会变成老年代，也就是说Region的区域功能可能会动态变化。</strong></p><p>G1垃圾收集器对于对象什么时候会转移到老年代跟之前讲过的原则一样，唯一不同的是对大对象的处理<br> G1有专门分配大对象的Region叫Humongous区，而不是让大对象直接进入老年代的Region中。在G1中，大对象的判定规则就是<strong>一个大对象超过了一个Region大小的50%</strong> ，比如按照上面算的，每个Region是2M，只要一个大对象超过了1M，就会被放入Humongous中，而且一个大对象如果太大，可能会横跨多个Region来存放。</p><p><strong>Humongous区专门存放短期巨型对象，不用直接进老年代，可以节约老年代的空间，避免因为老年代空间不够的GC开销。Full GC的时候除了收集年轻代和老年代之外，也会将Humongous区一并回收。</strong></p><p>G1收集器一次GC(主要指Mixed GC)的运作过程大致分为以下几个步骤：</p><p>​<img src="'+h+'" alt="image">​</p><ul><li><strong>初始标记(Init Mark,STW):</strong> 暂停所有其他线程，从gc roots开始标记gc roots能达到的第一个对象，这一步<strong>速度很快</strong>。</li><li><strong>并发标记(Concurrent Marking):</strong> 与业务线程一起运行，从第一步标记的对象开始，标记能达到所有对象</li><li><strong>最终标记(Remark,STW):</strong> 暂停所有其他线程，重新标记漏标对象。</li><li><strong>筛选回收(CleanUp,STW):</strong> 暂停所有其他线程，筛选回收阶段首先对各个Region的<strong>回收价值和成本进行排序，根据用户所期望的GC停顿STW时间(可以用JVM参数 -XX:MaxGCPauseMillis指定)来制定回收计划</strong>，比如说老年代此时有1000个Region都满了，但是因为根据预期停顿时间，本次垃圾回收可能只能停顿200毫秒，那么通过之前回收成本计算得知，可能回收其中800个Region刚好需要200ms，那么就只会回收800个Region(<strong>Collection Set</strong>，要回收的集合)，尽量把GC导致的停顿时间控制在我们指定的范围内。这个阶段其实也可以做到与用户程序一起并发执行，但是因为只回收一部分Region，时间是用户可控制的，而且停顿用户线程将大幅提高收集效率。不管是年轻代或是老年代，<strong>回收算法主要用的是复制算法，将一个region中的存活对象复制到另一个region中，这种不会像CMS那样回收完因为有很多内存碎片还需要整理一次，G1采用复制算法回收几乎不会有太多内存碎片</strong>。(注：CMS回收阶段是跟用户线程一起并发执行的，G1因为内部实现太复杂暂时没实现并发回收，不过到了ZGC，Shenandoah就实现了并发收集，Shenandoah可以看成是G1的升级版本)</li></ul><p>G1收集器在后台维护了一个优先列表，每次根据允许的收集时间，优先选择回收价值最大的Region(这也就是它的名字Garbage-First的由来)，比如一个Region花200ms能回收10M垃圾，另外一个Region花50ms能回收20M垃圾，在回收时间有限情况下，G1当然会优先选择后面这个Region回收。这种使用Region划分内存空间以及有优先级的区域回收方式，保证了G1收集器在有限时间内可以尽可能高的收集效率。</p><p>G1在处理多标和漏标的方式为 <strong>：</strong></p><ul><li><strong>多标：</strong> 暂不处理，形成浮动垃圾，在下次垃圾回收时再处理 <strong>。</strong></li><li><strong>漏标：</strong> 使用<strong>原始快照</strong>方式进行处理。</li></ul><p>G1被视为JDK1.7以后版本的Java虚拟机中一个重要进化特征。它具备以下特点：</p><ul><li><strong>并行与并发</strong>：G1能充分利用CPU、多核环境下的硬件优势，使用多个CPU（CPU或者CPU核心）来缩短Stop-The-World停顿时间。部分其他收集器原本需要停顿Java线程来执行GC动作，G1收集器仍然可以通过并发的方式让java程序继续执行。</li><li><strong>分代收集</strong>：虽然G1可以不需要其他收集器配合就能独立管理整个GC堆，但是还是保留了分代的概念。</li><li><strong>空间整合</strong>：与CMS的“标记--清理”算法不同，G1从整体来看是基于“标记整理”算法实现的收集器；从局部上来看是基于“复制”算法实现的。</li><li><strong>可预测的停顿</strong>：这是G1相对于CMS的另一个大优势，降低停顿时间是G1 和 CMS 共同的关注点，但G1 除了追求低停顿外，还能建立可预测的停顿时间模型，能让使用者明确指定在一个长度为M毫秒的时间片段(通过参数&quot;-XX:MaxGCPauseMillis&quot;指定)内完成垃圾收集。</li></ul><p>毫无疑问， 可以由用户指定期望的停顿时间是G1收集器很强大的一个功能， 设置不同的期望停顿时间， 可使得G1在不同应用场景中取得关注吞吐量和关注延迟之间的最佳平衡。 不过， 这里设置的“期望值”必须是符合实际的， 不能异想天开， 毕竟G1是要冻结用户线程来复制对象的， 这个停顿时间再怎么低也得有个限度。 它默认的停顿目标为两百毫秒， 一般来说， 回收阶段占到几十到一百甚至接近两百毫秒都很正常， 但如果我们把停顿时间调得非常低， 譬如设置为二十毫秒， 很可能出现的结果就是由于停顿目标时间太短， 导致每次选出来的回收集只占堆内存很小的一部分， 收集器收集的速度逐渐跟不上分配器分配的速度， 导致垃圾慢慢堆积。 很可能一开始收集器还能从空闲的堆内存中获得一些喘息的时间， 但应用运行时间一长就不行了， 最终占满堆引发Full GC反而降低性能， 所以通常把期望停顿时间设置为一两百毫秒或者两三百毫秒会是比较合理的。</p><h2 id="g1垃圾收集分类" tabindex="-1"><a class="header-anchor" href="#g1垃圾收集分类"><span>G1垃圾收集分类</span></a></h2><h3 id="younggc" tabindex="-1"><a class="header-anchor" href="#younggc"><span>YoungGC</span></a></h3><p>YoungGC并不是说现有的Eden区放满了就会马上触发，G1会计算下现在Eden区回收大概要多久时间，如果回收时间远远小于参数 -XX:MaxGCPauseMills 设定的值，那么增加年轻代的region，继续给新对象存放，不会马上做Young GC，直到下一次Eden区放满，G1计算回收时间接近参数 -XX:MaxGCPauseMills 设定的值，那么就会触发Young GC</p><h3 id="mixedgc" tabindex="-1"><a class="header-anchor" href="#mixedgc"><span>MixedGC</span></a></h3><p>MixedGC不是FullGC，当老年代占有率达到了参数<code>-XX:InitiatingHeapOccupancyPercent</code>​设置的值时则触发，回收所有的Young和部分old(根据期望的GC停顿时间确定old区垃圾收集的优先顺序)以及<strong>大对象区</strong>，正常情况G1的垃圾收集是先做MixedGC，主要使用复制算法，需要把各个region中的对象拷贝到别的region中。拷贝的过程中发现没有足够的空region能够承载拷贝对象就会触发一次FullGC。</p><h3 id="fullgc" tabindex="-1"><a class="header-anchor" href="#fullgc"><span>FullGC</span></a></h3><p>停止系统线程，然后采用单线程进行标记、清理和压缩整理，好空闲出来一批Region来供下一次MixedGC使用，这个过程是非常耗时的。(Shenandoah优化成多线程收集了)</p><h3 id="g1收集器参数设置" tabindex="-1"><a class="header-anchor" href="#g1收集器参数设置"><span><strong>G1收集器参数设置</strong></span></a></h3><ul><li><strong>-XX:+UseG1GC:</strong> 使用G1收集器</li><li><strong>-XX:ParallelGCThreads:</strong> 指定GC工作的线程数量</li><li><strong>-XX:G1HeapRegionSize:</strong> 指定分区大小(1MB~32MB，且必须是2的N次幂)，默认将整堆划分为2048个分区</li><li><strong>-XX:MaxGCPauseMillis:</strong> 目标暂停时间(默认200ms)</li><li><strong>-XX:G1NewSizePercent:</strong> 新生代内存初始空间(默认整堆5%，值配置整数，默认就是百分比)</li><li><strong>-XX:G1MaxNewSizePercent:</strong> 新生代内存最大空间</li><li><strong>-XX:TargetSurvivorRatio:</strong> Survivor区的填充容量(默认50%)，Survivor区域里的一批对象(年龄1+年龄2+年龄n的多个年龄对象)总和超过了Survivor区域的50%，此时就会把年龄n(含)以上的对象都放入老年代</li><li><strong>-XX:MaxTenuringThreshold:</strong> 最大年龄阈值(默认15)</li><li><strong>-XX:InitiatingHeapOccupancyPercent:</strong> 老年代占用空间达到整堆内存阈值(默认45%)，则执行新生代和老年代的混合收集(MixedGC)，比如我们之前说的堆默认有2048个region，如果有接近1000个region都是老年代的region，则可能就要触发MixedGC了</li><li><strong>-XX:G1MixedGCLiveThresholdPercent(默认85%):</strong> region中的存活对象低于这个值时才会回收该region，如果超过这个值，存活对象过多，回收的的意义不大。</li><li><strong>-XX:G1MixedGCCountTarget:</strong> 在一次回收过程中指定做几次筛选回收(默认8次)，这个参数标识最后的混合回收阶段会执行8次，一次只回收掉一部分的Region，然后系统继续运行，过了一小段时间之后，又再次进行混合回收，重复8次，这样可以让系统不至于单次停顿时间过长。</li><li><strong>-XX:G1HeapWastePercent(默认5%):</strong> gc过程中空出来的region是否充足阈值，在混合回收的时候，对Region回收都是基于复制算法进行的，都是把要回收的Region里的存活对象放入其他Region，然后这个Region中的垃圾对象全部清理掉，这样的话在回收过程就会不断空出来新的Region，一旦空闲出来的Region数量达到了堆内存的5%，此时就会立即停止混合回收，意味着本次混合回收就结束了。</li></ul><h3 id="g1垃圾收集器优化建议" tabindex="-1"><a class="header-anchor" href="#g1垃圾收集器优化建议"><span><strong>G1垃圾收集器优化建议</strong></span></a></h3><p>假设参数 -XX:MaxGCPauseMills 设置的值很大，导致系统运行很久，年轻代可能都占用了堆内存的60%了，此时才触发年轻代gc。那么存活下来的对象可能就会很多，此时就会导致Survivor区域放不下那么多的对象，就会进入老年代中。或者是当年轻代gc过后，存活下来的对象过多，导致进入Survivor区域后触发了动态年龄判定规则，达到了Survivor区域的50%，也会快速导致一些对象进入老年代中。</p><p>所以这里的优化核心还是在于调节 -XX:MaxGCPauseMills 这个参数的值，在保证他的年轻代gc别太频繁的同时，还得考虑每次gc过后的存活对象有多少,避免存活对象太多快速进入老年代，频繁触发mixed gc。</p><h3 id="什么场景适合使用g1" tabindex="-1"><a class="header-anchor" href="#什么场景适合使用g1"><span><strong>什么场景适合使用G1</strong></span></a></h3><ol><li>50%以上的堆被存活对象占用</li><li>对象分配和晋升的速度变化非常大</li><li>垃圾回收时间特别长，超过1秒</li><li>8GB以上的堆内存(建议值)</li><li>停顿时间是500ms以内</li></ol><h3 id="每秒几十万并发的系统如何优化jvm" tabindex="-1"><a class="header-anchor" href="#每秒几十万并发的系统如何优化jvm"><span><strong>每秒几十万并发的系统如何优化JVM</strong></span></a></h3><p>Kafka类似的支撑高并发消息系统大家肯定不陌生，对于kafka来说，每秒处理几万甚至几十万消息时很正常的，一般来说部署kafka需要用大内存机器(比如64G)，也就是说可以给年轻代分配个三四十G的内存用来支撑高并发处理，这里就涉及到一个问题，我们以前常说的对于eden区的young gc是很快的，这种情况下它的执行还会很快吗？很显然，不可能，因为内存太大，处理还是要花不少时间的，假设三四十G内存回收可能最快也要几秒钟，按kafka这个并发量放满三四十G的eden区可能也就一两分钟，那么意味着整个系统每运行一两分钟就会因为young gc卡顿几秒钟没法处理新消息，显然是不行的。</p><p>对于这种情况，我们可以使用G1收集器，假设50ms能够回收三到四个G内存，那么设置 -XX:MaxGCPauseMills 为50ms，然后50ms的卡顿其实完全能够接受，用户几乎无感知，这样整个系统就可以在卡顿几乎无感知的情况下一边处理业务一边收集垃圾。</p><div class="hint-container info"><p class="hint-container-title">适用场景</p><p>G1垃圾回收器天生适合这种大JVM内存的场景，可以有效解决大内存带来的垃圾回收时间过长问题。</p></div><h2 id="zgc收集器-xx-usezgc" tabindex="-1"><a class="header-anchor" href="#zgc收集器-xx-usezgc"><span>ZGC收集器( <strong>-XX:+UseZGC)</strong></span></a></h2>',37),x={class:"hint-container note"},f=e("p",{class:"hint-container-title"},"参考文章",-1),R={href:"https://wiki.openjdk.java.net/display/zgc/Main",target:"_blank",rel:"noopener noreferrer"},k={href:"http://cr.openjdk.java.net/~pliden/slides/ZGC-Jfokus-2018.pdf",target:"_blank",rel:"noopener noreferrer"},v=e("p",null,"ZGC是JDK11开始引入的一个新的低延时垃圾收集器，它的目标之一是将STW控制在10ms左右的同时，支持最高TB级别内存的垃圾回收。",-1),X={class:"hint-container note"},Z=e("p",{class:"hint-container-title"},"注",-1),z=e("p",null,"根据R大的说法，ZGC是根据Azul的论文，通过软件方式设计的",-1),J={href:"https://www.usenix.org/legacy/events/vee05/full_papers/p46-click.pdf",target:"_blank",rel:"noopener noreferrer"},S=e("p",null,"Azul PGC简单来说是：它是一个mark-compact GC，但是GC过程中所有的阶段都设计为可以并发的，包括移动对象的阶段，所以GC正常工作的时候除了会在自己的线程上吃点CPU之外并不会显著干扰应用的运行。为了实现上方便，PGC虽然算法上可以做成完全并发，但Azul PGC在Azul VM里的实现还是有三个非常短暂的safepoint，其中第一个是做根集合（root set）扫描，包括全局变量啊线程栈啊啥的里面的对象指针，但不包括GC堆里的对象指针，所以这个暂停就不会随着GC堆的大小而变化（不过会根据线程的多少啊、线程栈的大小之类的而变化）。另外两个暂停也同样不会随着堆大小而变化。",-1),E=t('<h3 id="zgc的目标" tabindex="-1"><a class="header-anchor" href="#zgc的目标"><span>ZGC的目标</span></a></h3><p>​<img src="'+d+'" alt="image">​</p><ol><li><strong>支持TB量级的堆：</strong> 在半导体现有的发展情况下，TB级别的堆内存支持，基本可以满足之后数十年的发展。</li><li><strong>最大的GC停顿时间不超过10ms</strong>：目前一般线上环境运行良好的JAVA应用Minor GC停顿时间在10ms左右，Major GC一般都需要100ms以上（G1可以调节停顿时间，但是如果调的过低的话，反而会适得其反），之所以能做到这一点是因为它的停顿时间主要跟Root扫描有关，而Root数量和堆大小是没有任何关系的。</li><li><strong>奠定未来GC的基础</strong></li><li><strong>最糟糕的情况下吞吐量下降15%</strong></li></ol><p>另外，Oracle官方提到了它最大的优点是：它的停顿时间不会随着堆的增大而增长！也就是说，几十G堆的停顿时间是10ms以下，几百G甚至上T堆的停顿时间也是10ms以下。</p><h3 id="不分代-暂时" tabindex="-1"><a class="header-anchor" href="#不分代-暂时"><span>不分代(暂时)</span></a></h3><p>不区分年轻代和老年代。之前的垃圾收集器进行分代区分是基于&quot;大部分对象都是朝生夕死&quot;的假设，事实上大部分系统的对象也是这种情况。但ZGC目前实现起来太麻烦。具体可参考R大在2018年知乎的回答。</p>',6),B={href:"https://www.zhihu.com/question/283175962",target:"_blank",rel:"noopener noreferrer"},V=t('<h3 id="zgc内存布局" tabindex="-1"><a class="header-anchor" href="#zgc内存布局"><span>ZGC内存布局</span></a></h3><p>ZGC是一款基于Region内存布局的，暂时不分代的垃圾收集器，主要使用读屏障，颜色指针等技术实现可并发收集垃圾的垃圾收集器，主要使用标记-整理算法实现。</p><p>ZGC的Region可分为大、中、小三类：</p><ul><li><strong>小型Region（Small Region） ：</strong> 容量固定为2MB， 用于放置小于256KB的小对象。</li><li><strong>中型Region（Medium Region） ：</strong> 容量固定为32MB， 用于放置大于等于256KB但小于4MB的对象。</li><li><strong>大型Region（Large Region） ：</strong> 容量不固定， 可以动态变化， 但必须为2MB的整数倍， 用于放置4MB或以上的大对象。 每个大型Region中只会存放一个大对象， 这也预示着虽然名字叫作“大型Region”， 但它的实际容量完全有可能小于中型Region， 最小容量可低至4MB。 大型Region在ZGC的实现中是不会被重分配的， 因为复制一个大对象的代价非常高昂。</li></ul><p>​<img src="'+G+'" alt="image">​</p><h3 id="zgc收集过程" tabindex="-1"><a class="header-anchor" href="#zgc收集过程"><span>ZGC收集过程</span></a></h3><p>​<img src="'+m+'" alt="image">​</p><ul><li><strong>并发标记(Concurrent Mark)：</strong> 和G1一样，并发标记也是遍历对象图做可达性分析的阶段，它的初始标记(Pause Mark Start)和最终标记(Pause Mark End)阶段会短暂的暂停。但与其说是标记对象(记录对象是否一般标记)，不如说是标记指针(记录指针是否已经被标记)，此时会更新指针中Marked0和Marked1标志位。</li><li><strong>并发预备重分配(Concurrent Prepare for Relocate):</strong> 这个阶段需要根据特定的查询条件统计得出本次收集过程要清理哪些Region，将这些Region组成重分配集（Relocation Set）。ZGC每次回收都会扫描所有的Region，用范围更大的扫描成本换取省去G1中记忆集的维护成本。</li><li><strong>并发重分配(Concurrent Relocate):</strong> 重分配是ZGC执行过程中的核心阶段，这个过程要把重分配集中的存活对象复制到新的Region上，并为重分配集中的每个Region维护一个转发表（Forward Table），记录从旧对象到新对象的转向关系。ZGC收集器能仅从引用上就明确得知一个对象是否处于重分配集之中，如果用户线程此时并发访问了位于重分配集中的对象，这次访问将会被预置的内存屏障(读屏障)所截获，然后立即根据Region上的转发表记录将访问转发到新复制的对象上，并同时修正更新该引用的值，使其直接指向新对象，ZGC将这种行为称为指针的“自愈”（Self-Healing）能力</li></ul><blockquote><p>ZGC的颜色指针因为“自愈”（Self-Healing）能力，所以只有第一次访问旧对象会变慢， 一旦重分配集中某个Region的存活对象都复制完毕后， 这个Region就可以立即释放用于新对象的分配，但是转发表还得留着不能释放掉， 因为可能还有访问在使用这个转发表。</p></blockquote><ul><li><strong>并发重映射(Concurrent Remap):</strong> 重映射所做的就是修正整个堆中指向重分配集中旧对象的所有引用，但是ZGC中对象引用存在“自愈”功能，所以这个重映射操作并不是很迫切。ZGC很巧妙地把并发重映射阶段要做的工作，合并到了下一次垃圾收集循环中的并发标记阶段里去完成，反正它们都是要遍历所有对象的，这样合并就节省了一次遍历对象图的开销。一旦所有指针都被修正之后， 原来记录新旧对象关系的转发表就可以释放掉了</li></ul><h3 id="颜色指针" tabindex="-1"><a class="header-anchor" href="#颜色指针"><span>颜色指针</span></a></h3><p>Colored Pointers，即颜色指针，如下图所示，ZGC的核心设计之一。以前的垃圾回收器的GC信息都保存在对象头中，而ZGC的GC信息保存在指针中。</p><p>​<img src="'+u+'" alt="image">​</p><p>‍</p><p>每个对象有64位的指针，具体被划分为：</p><ul><li>18位：预留位，给之后使用。</li><li>1位：Finalizable标识，用于并发引用有关，它表示这个对象只能通过finalizer才能引用。</li><li>1位：Remapped标识，表示该对象未指向重分配集（Relocation Set，表示需要GC的Region集合）中。</li><li>1位：Marked1标识，与Marked0配合使用</li><li>1位：Marked0标识，和Marked1配合用于辅助GC</li><li>42位：对象地址，因此ZGC可以支持2^42=4TB内存</li></ul><p>在每个GC周期开始，颜色指针就会互换标志位，使上次GC周期中修正的标志位失效，这样，所有标志都变成了未标记，这时再做GC进行标记存活的对象，并通过标记整理算法清除垃圾对象。</p><ul><li><p>GC周期1：使用Marked0，即周期结束标识为01</p></li><li><p>GC周期2：使用Marked1，即周期结束标识为10，这样，所有期望的引用都能被重新标记。</p></li></ul><p>ZGC使用了指针的第19-22位，因此ZGC无法使用指针压缩，同时也无法支持32位的操作系统。</p><h4 id="三大优势" tabindex="-1"><a class="header-anchor" href="#三大优势"><span><strong>三大优势</strong></span></a></h4><ol><li>因为使用了读屏障，一旦某个Region的存活对象被移走之后，这个Region立即就能够被释放和重用掉，而不必等待整个堆中所有指向该Region的引用都被修正后才能清理，这使得理论上只要还有一个空闲Region，ZGC就能完成收集。</li><li>颜色指针可以大幅减少在垃圾收集过程中内存屏障的使用数量，ZGC只使用了读屏障。</li><li>颜色指针具备强大的扩展性，它可以作为一种可扩展的存储结构用来记录更多与对象标记、重定位过程相关的数据，以便日后进一步提高性能。</li></ol><h4 id="读屏障" tabindex="-1"><a class="header-anchor" href="#读屏障"><span><strong>读屏障</strong></span></a></h4><p>ZGC之前的垃圾回收器在处理漏标时使用的都是写屏障(Write Barrier)，ZGC使用了完全不同的读屏障(Load Barrier)。在标记和移动阶段，每次从堆内对象的引用类型中读取一个指针时，都会加上一个Load Barriers。</p><p>如下面的代码，第一行代码我们尝试读取堆中的一个对象引用obj.fieldA并赋给引用o（fieldA也是一个对象时才会加上读屏障）。如果这时候对象在GC时被移动了，接下来JVM就会加上一个读屏障，这个屏障会把读出的指针更新到对象的新地址上，并且把堆里的这个指针“修正”到原本的字段里。这样就算GC把对象移动了，读屏障也会发现并修正指针，于是应用代码就永远都会持有更新后的有效指针，而且不需要STW。</p><p>那么，JVM是如何判断对象被移动过呢？就是利用上面提到的颜色指针，如果指针是Bad Color，那么程序还不能往下执行，需要「slow path」，修正指针；如果指针是Good Color，那么正常往下执行即可：</p><p>​<img src="'+C+'" alt="image">​</p><p>后面3行代码都不需要加读屏障：</p><ul><li>Object p = o这行代码并没有从堆中读取数据；</li><li>o.doSomething()也没有从堆中读取数据；</li><li>obj.fieldB不是对象引用，而是原子类型。</li></ul><p>正是因为Load Barriers的存在，所以会导致配置ZGC的应用的吞吐量会变低。官方的测试数据是需要多出额外4%的开销：</p><p>​<img src="'+M+'" alt="image">​</p><p>那么，判断对象是Bad Color还是Good Color的依据是什么呢？就是根据上一段提到的Colored Pointers的4个颜色位。当加上读屏障时，根据对象指针中这4位的信息，就能知道当前对象是Bad/Good Color了。</p><div class="hint-container info"><p class="hint-container-title">思考</p><p>既然低42位指针可以支持4T内存，那么能否通过预约更多位给对象地址来达到支持更大内存的目的呢？</p><p>答案肯定是不可以。因为目前主板地址总线最宽只有48bit，4位是颜色位，就只剩44位了，所以受限于目前的硬件，ZGC最大只能支持16T的内存，JDK13就把最大支持堆内存从4T扩大到了16T。</p></div><h3 id="zgc存在的问题" tabindex="-1"><a class="header-anchor" href="#zgc存在的问题"><span>ZGC存在的问题</span></a></h3><p>ZGC最大的问题是<strong>浮动垃圾</strong>。ZGC的停顿时间是在10ms以下，但是ZGC的总的执行时间还是远远大于这个时间的。假如ZGC全过程需要执行10分钟，在这个期间由于对象分配速率很高，将创建大量的新对象，这些对象很难进入当次GC，所以只能在下次GC的时候进行回收，这些只能等到下次GC才能回收的对象就是浮动垃圾。</p>',34),P={class:"hint-container note"},T=e("p",{class:"hint-container-title"},"ZGC问题",-1),w={href:"https://www.zhihu.com/search?q=%E5%AF%B9%E8%B1%A1%E5%88%86%E9%85%8D%E9%80%9F%E7%8E%87&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A458761494%7D",target:"_blank",rel:"noopener noreferrer"},F=e("br",null,null,-1),A=e("br",null,null,-1),j={href:"https://www.zhihu.com/question/287945354/answer/458761494",target:"_blank",rel:"noopener noreferrer"},U=t('<p>启用ZGC比较简单，设置JVM参数即可：-XX:+UnlockExperimentalVMOptions 「-XX:+UseZGC」。调优也并不难，因为ZGC调优参数并不多，远不像CMS那么复杂。它和G1一样，可以调优的参数都比较少，大部分工作JVM能很好的自动完成。下图所示是ZGC可以调优的参数：</p><p>​<img src="'+b+'" alt="image">​</p><h3 id="zgc触发时机" tabindex="-1"><a class="header-anchor" href="#zgc触发时机"><span><strong>ZGC触发时机</strong></span></a></h3><p>ZGC目前有4中机制触发GC：</p><ul><li>定时触发，默认为不使用，可通过ZCollectionInterval参数配置。</li><li>预热触发，最多三次，在堆内存达到10%、20%、30%时触发，主要时统计GC时间，为其他GC机制使用。</li><li>分配速率，基于正态分布统计，计算内存99.9%可能的最大分配速率，以及此速率下内存将要耗尽的时间点，在耗尽之前触发GC（耗尽时间 - 一次GC最大持续时间 - 一次GC检测周期时间）。</li><li>主动触发，（默认开启，可通过ZProactive参数配置） 距上次GC堆内存增长10%，或超过5分钟时，对比距上次GC的间隔时间跟（49 * 一次GC的最大持续时间），超过则触发。</li></ul><h2 id="如何选择垃圾回收器" tabindex="-1"><a class="header-anchor" href="#如何选择垃圾回收器"><span>如何选择垃圾回收器</span></a></h2><ol><li>优先调整堆的大小让服务器自己来选择</li><li>如果内存小于100M，使用串行收集器</li><li>如果是单核，并且没有停顿时间的要求，串行或JVM自己选择</li><li>如果允许停顿时间超过1秒，选择并行或者JVM自己选</li><li>如果响应时间最重要，并且不能超过1秒，使用并发收集器</li><li>4G以下可以用parallel，4-8G可以用ParNew+CMS，8G以上可以用G1，几百G以上用ZGC</li></ol><p>下图有连线的可以搭配使用</p><p>​<img src="'+l+'" alt="image">​</p><p>JDK 1.8默认使用 Parallel(年轻代和老年代都是)</p><p>JDK 1.9开始默认使用 G1，JDK11中删除了CMS垃圾收集器</p><h2 id="安全点与安全区域" tabindex="-1"><a class="header-anchor" href="#安全点与安全区域"><span>安全点与安全区域</span></a></h2><h4 id="安全点-safe-point" tabindex="-1"><a class="header-anchor" href="#安全点-safe-point"><span>安全点(Safe Point)</span></a></h4><p>安全点就是指代码中的一些特定的位置，当线程运行到这些位置时，它的状态是可以确定的，JVM就可以安全的进行一些操作，比如GC等。因此GC也不是随时都能立即触发的，需要等到所有线程运行到安全点时才能触发。</p><p>特定的位置有</p><ol><li>方法返回之前</li><li>调用某个方法之后</li><li>抛出异常的位置</li><li>循环的末尾</li></ol><div class="hint-container info"><p class="hint-container-title">思路</p><p>大体实现思想是当垃圾收集需要中断线程的时候， 不直接对线程操作， 仅仅简单地设置一个标志位， 各个线程执行过程时会不停地主动去轮询这个标志， 一旦发现中断标志为真时就自己在最近的安全点上主动中断挂起。 轮询标志的地方和安全点是重合的</p></div><h4 id="安全区域-safe-region" tabindex="-1"><a class="header-anchor" href="#安全区域-safe-region"><span>安全区域(Safe Region)</span></a></h4><p>Safe Point是针对正在执行线程设计的，但程序运行中会存在Sleep或者中断的线程，这种线程无法响应JVM的中断请求。因此JVM引入安全区域(Safe Region)概念，Safe Region是指在一段代码片段中，对象的引用关系不会发生变化。在这个区域内进行GC都是安全的。</p>',19);function N(q,H){const n=a("ExternalLinkIcon");return r(),g("div",null,[y,e("div",x,[f,e("p",null,[e("a",R,[i("https://wiki.openjdk.java.net/display/zgc/Main"),o(n)])]),e("p",null,[e("a",k,[i("http://cr.openjdk.java.net/~pliden/slides/ZGC-Jfokus-2018.pdf"),o(n)])])]),v,e("div",X,[Z,z,e("p",null,[e("a",J,[i("https://www.usenix.org/legacy/events/vee05/full_papers/p46-click.pdf"),o(n)])]),S]),E,e("blockquote",null,[e("p",null,[e("a",B,[i("为何 ZGC 不像C4 GC一样采用分代机制？是因为实现复杂度还是另有考虑？ - 知乎 (zhihu.com)"),o(n)])])]),V,e("div",P,[T,e("p",null,[i("Per大大毫无遮掩地表示当前的ZGC如果遇到非常高的"),e("a",w,[i("对象分配速率"),o(n)]),i("（allocation rate）的话会跟不上，目前唯一有效的“调优”方式就是增大整个GC堆的大小来让ZGC有更大的喘息空间。而添加分代或者Thread-Local GC则可以有效降低这种情况下对堆大小（喘息空间）的需求。"),F,i(" 作者：RednaxelaFX"),A,i(" 来源："),e("a",j,[i("知乎"),o(n)])])]),U])}const K=s(_,[["render",N],["__file","05-JVM的垃圾收集器（下）.html.vue"]]),L=JSON.parse('{"path":"/statudy/JVM/05-JVM%E7%9A%84%E5%9E%83%E5%9C%BE%E6%94%B6%E9%9B%86%E5%99%A8%EF%BC%88%E4%B8%8B%EF%BC%89.html","title":"05-JVM的垃圾收集器（下）","lang":"zh-CN","frontmatter":{"title":"05-JVM的垃圾收集器（下）","order":5,"date":"2024-04-08T00:00:00.000Z","category":["JVM"],"tag":["JVM","垃圾收集器"],"description":"G1垃圾收集器(-XX:+UseG1GC) G1 (Garbage-First)是一款面向服务器的垃圾收集器,主要针对配备多颗处理器及大容量内存的机器. 以极高概率满足GC停顿时间要求的同时,还具备高吞吐量性能特征. ​image​ ​image​ G1将Java堆划分为多个大小相等的独立区域（Region），JVM目标是不超过2048个Region(...","head":[["meta",{"property":"og:url","content":"https://xsyl06.github.io/myblog/myblog/statudy/JVM/05-JVM%E7%9A%84%E5%9E%83%E5%9C%BE%E6%94%B6%E9%9B%86%E5%99%A8%EF%BC%88%E4%B8%8B%EF%BC%89.html"}],["meta",{"property":"og:site_name","content":"Xsyl06的博客"}],["meta",{"property":"og:title","content":"05-JVM的垃圾收集器（下）"}],["meta",{"property":"og:description","content":"G1垃圾收集器(-XX:+UseG1GC) G1 (Garbage-First)是一款面向服务器的垃圾收集器,主要针对配备多颗处理器及大容量内存的机器. 以极高概率满足GC停顿时间要求的同时,还具备高吞吐量性能特征. ​image​ ​image​ G1将Java堆划分为多个大小相等的独立区域（Region），JVM目标是不超过2048个Region(..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240328144128-wi4y9gk.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-08T09:26:37.000Z"}],["meta",{"property":"article:author","content":"xsyl06"}],["meta",{"property":"article:tag","content":"JVM"}],["meta",{"property":"article:tag","content":"垃圾收集器"}],["meta",{"property":"article:published_time","content":"2024-04-08T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-04-08T09:26:37.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"05-JVM的垃圾收集器（下）\\",\\"image\\":[\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240328144128-wi4y9gk.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240328144147-ok38h8z.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240328162347-reb22tz.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240401225915-83cdy4d.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/network-asset-1658138759528-3d9e4c26-0ec5-4022-bb65-8872869f703d-20240407102751-s2yu49s.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240407105001-l22i6rl.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240407173719-4o4ztyi.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240408111211-klxqkoo.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240408111331-3fhepwd.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240408111725-omdfhgv.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240221224025-ip60b66.png\\"],\\"datePublished\\":\\"2024-04-08T00:00:00.000Z\\",\\"dateModified\\":\\"2024-04-08T09:26:37.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"xsyl06\\",\\"url\\":\\"https://gitee.com/xsyl06\\"}]}"]]},"headers":[{"level":2,"title":"G1垃圾收集器(-XX:+UseG1GC)","slug":"g1垃圾收集器-xx-useg1gc","link":"#g1垃圾收集器-xx-useg1gc","children":[]},{"level":2,"title":"G1垃圾收集分类","slug":"g1垃圾收集分类","link":"#g1垃圾收集分类","children":[{"level":3,"title":"YoungGC","slug":"younggc","link":"#younggc","children":[]},{"level":3,"title":"MixedGC","slug":"mixedgc","link":"#mixedgc","children":[]},{"level":3,"title":"FullGC","slug":"fullgc","link":"#fullgc","children":[]},{"level":3,"title":"G1收集器参数设置","slug":"g1收集器参数设置","link":"#g1收集器参数设置","children":[]},{"level":3,"title":"G1垃圾收集器优化建议","slug":"g1垃圾收集器优化建议","link":"#g1垃圾收集器优化建议","children":[]},{"level":3,"title":"什么场景适合使用G1","slug":"什么场景适合使用g1","link":"#什么场景适合使用g1","children":[]},{"level":3,"title":"每秒几十万并发的系统如何优化JVM","slug":"每秒几十万并发的系统如何优化jvm","link":"#每秒几十万并发的系统如何优化jvm","children":[]}]},{"level":2,"title":"ZGC收集器( -XX:+UseZGC)","slug":"zgc收集器-xx-usezgc","link":"#zgc收集器-xx-usezgc","children":[{"level":3,"title":"ZGC的目标","slug":"zgc的目标","link":"#zgc的目标","children":[]},{"level":3,"title":"不分代(暂时)","slug":"不分代-暂时","link":"#不分代-暂时","children":[]},{"level":3,"title":"ZGC内存布局","slug":"zgc内存布局","link":"#zgc内存布局","children":[]},{"level":3,"title":"ZGC收集过程","slug":"zgc收集过程","link":"#zgc收集过程","children":[]},{"level":3,"title":"颜色指针","slug":"颜色指针","link":"#颜色指针","children":[{"level":4,"title":"三大优势","slug":"三大优势","link":"#三大优势","children":[]},{"level":4,"title":"读屏障","slug":"读屏障","link":"#读屏障","children":[]}]},{"level":3,"title":"ZGC存在的问题","slug":"zgc存在的问题","link":"#zgc存在的问题","children":[]},{"level":3,"title":"ZGC触发时机","slug":"zgc触发时机","link":"#zgc触发时机","children":[]}]},{"level":2,"title":"如何选择垃圾回收器","slug":"如何选择垃圾回收器","link":"#如何选择垃圾回收器","children":[]},{"level":2,"title":"安全点与安全区域","slug":"安全点与安全区域","link":"#安全点与安全区域","children":[{"level":4,"title":"安全点(Safe Point)","slug":"安全点-safe-point","link":"#安全点-safe-point","children":[]},{"level":4,"title":"安全区域(Safe Region)","slug":"安全区域-safe-region","link":"#安全区域-safe-region","children":[]}]}],"git":{"createdTime":1712568397000,"updatedTime":1712568397000,"contributors":[{"name":"Wang","email":"xsyl06@qq.com","commits":1}]},"readingTime":{"minutes":25.23,"words":7568},"filePathRelative":"statudy/JVM/05-JVM的垃圾收集器（下）.md","localizedDate":"2024年4月8日","excerpt":"<h2>G1垃圾收集器(-XX:+UseG1GC)</h2>\\n<p>G1 (Garbage-First)是一款面向服务器的垃圾收集器,主要针对配备多颗处理器及大容量内存的机器. 以极高概率满足GC停顿时间要求的同时,还具备高吞吐量性能特征.</p>\\n<p>​<img src=\\"/assets/img/image-20240328144128-wi4y9gk.png\\" alt=\\"image\\">​</p>\\n<p>​<img src=\\"/assets/img/image-20240328144147-ok38h8z.png\\" alt=\\"image\\">​</p>\\n<p>G1将Java堆划分为多个大小相等的独立区域（Region），JVM目标是不超过2048个Region(JVM源码里TARGET_REGION_NUMBER 定义)，实际可以超过该值，但是不推荐。<br>\\n一般Region大小等于堆大小除以2048，比如堆大小为4096M，则Region大小为2M，当然也可以用参数<code>-XX:G1HeapRegionSize</code>​手动指定Region大小，但是推荐默认的计算方式。</p>","autoDesc":true}');export{K as comp,L as data};
