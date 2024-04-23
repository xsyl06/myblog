import{_ as l}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as t,o as p,c as i,d as s,e as n,b as o,a}from"./app-tWsBgK15.js";const c="/myblog/assets/img/image-20240417102513-4dzhcn8.png",r="/myblog/assets/img/image-20240417141345-anbbmj8.png",d="/myblog/assets/img/image-20240417141435-znemzpm.png",u="/myblog/assets/img/image-20240417141525-mwhgcod.png",m="/myblog/assets/img/image-20240417141551-glktq9u.png",h="/myblog/assets/img/image-20240417141649-z1m1zw1.png",g={},y=a(`<h2 id="mysql慢查询日志" tabindex="-1"><a class="header-anchor" href="#mysql慢查询日志"><span>Mysql慢查询日志</span></a></h2><p>慢查询日志，顾名思义，就是查询花费大量时间的日志，是指mysql记录所有执行超过long_query_time参数设定的时间阈值的SQL语句的日志。该日志能为SQL语句的优化带来很好的帮助。默认情况下，慢查询日志是关闭的，要使用慢查询日志功能，首先要开启慢查询日志功能。</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">show</span> VARIABLES <span class="token operator">like</span> <span class="token string">&#39;slow_query_log&#39;</span><span class="token punctuation">;</span>
<span class="token comment">#开启慢查询日志</span>
<span class="token keyword">set</span> <span class="token keyword">GLOBAL</span> slow_query_log<span class="token operator">=</span><span class="token number">1</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>多少时间算慢查询，mysql中有一个参数作为阈值，运行时间超过该阈值的sql都会被记录到慢查询日志中，long_query_time默认10s。</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">show</span> VARIABLES <span class="token operator">like</span> <span class="token string">&#39;%long_query_time%&#39;</span><span class="token punctuation">;</span>
<span class="token keyword">set</span> <span class="token keyword">global</span> long_query_time<span class="token operator">=</span><span class="token number">10</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>同时对于没有运行的SQL语句没有使用索引，则MySQL数据库也可以将这条SQL语句记录到慢查询日志文件，控制参数是：</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">show</span> VARIABLES <span class="token operator">like</span> <span class="token string">&#39;%log_queries_not_using_indexes%&#39;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="优化sql查询方法" tabindex="-1"><a class="header-anchor" href="#优化sql查询方法"><span>优化SQL查询方法</span></a></h2><p>查询性能低下最基本的原因是访问的数据太多。大部分性能低下的查询都可以通过减少访问的数据量的方式进行优化。对于低效的查询，一般通过下面两个步骤来分析总是很有效:</p><ol><li>确认应用程序是否在检索大量超过需要的数据。这通常意味着访问了太多的行，但有时候也可能是访问了太多的列。</li><li>确认MySQL服务器层是否在分析大量超过需要的数据行。</li></ol><h3 id="业务层请求了不需要的数据" tabindex="-1"><a class="header-anchor" href="#业务层请求了不需要的数据"><span>业务层请求了不需要的数据</span></a></h3><p>有些查询会请求超过需要的数据，然后这些不满足需要的数据会被程序丢弃，这会给mysql的服务器性能带来额外的压力以及额外的网络开销，同时会消耗额外的cpu和内存。</p><h4 id="查询出不需要的行" tabindex="-1"><a class="header-anchor" href="#查询出不需要的行"><span>查询出不需要的行</span></a></h4><p>程序先select出大量结果，然后获取前面N行后关闭结果集（例如某程序获取了100行数据，但页面只展示前10条）</p><h4 id="总是查询出所有的列" tabindex="-1"><a class="header-anchor" href="#总是查询出所有的列"><span>总是查询出所有的列</span></a></h4><p>获取非业务需要的列，会有时无法使用索引覆盖从而导致回表，而从二级索引回表查询属于随机I/O，在查询时只获取业务需要的列，可在建立索引时看能否进行索引覆盖减少回表次数。</p><p>但也并非不能查询所有列，比如当数据需要进行缓存时，通过一次较慢的sql查询，然后将数据存放到缓存中后，之后的查询可查询响应速度较快的缓存，那么这个查询也是可以接受的。又或者如果这种有点浪费数据库资源的方式可以简化开发，能提高相同代码片段的复用性，如果业务清楚这样做的性能影且可接受，那么这种做法也是可以考虑的。</p><h3 id="执行层是否存在额外记录的扫描" tabindex="-1"><a class="header-anchor" href="#执行层是否存在额外记录的扫描"><span>执行层是否存在额外记录的扫描</span></a></h3><p>在确定查询只返回需要的数据以后，接下来应该看看查询为了返回结果是否扫描了过多的数据。对于MySQL，最简单的衡量查询开销的三个指标如下：​</p><ol><li>响应时间</li><li>扫描行数</li><li>返回行数</li></ol><h4 id="响应时间" tabindex="-1"><a class="header-anchor" href="#响应时间"><span>响应时间</span></a></h4><p>响应时间分为两个部分之和：<strong>处理时间</strong>和<strong>排队时间</strong></p><ul><li>处理时间：数据库处理这个sql真正的时间</li><li>排队时间：服务器等待某些资源而没有真正执行查询的时间-比如等待I/O操作，也可能在等待锁的释放等等。</li></ul><h4 id="扫描行数和返回行数" tabindex="-1"><a class="header-anchor" href="#扫描行数和返回行数"><span>扫描行数和返回行数</span></a></h4><p>扫描行数和返回行数可以在一定程度上反应该查找到需要的数据的效率高不高。理想情况下，扫描行数和返回行数应该相同，但这种情况一般不多。常见的是limit的使用；在做分页的时候，我们一般使用limit加上偏移量的方式实现。在偏移量非常大的时候，会出现这种情况。</p><p>在评估查询开销的时候，需要考虑一下从表中找到某一行数据的成本。MySQL有好几种访问方式可以查找并返回一行结果。有些访问方式可能需要扫描很多行才能返回一行结果，也有些访问方式可能无须扫描就能返回结果。</p><p>EXPLAIN语句中的type列反应了访问类型。访问类型有很多种，从全表扫描到索引扫描、范围扫描、唯一索引查询、常数引用等，速度是从慢到快，扫描的行数也是从小到大。</p><p>如果查询没有办法找到合适的访问类型，那么解决的最好办法通常就是增加一个合适的索引，可以让 MySQL以最高效、扫描行数最少的方式找到需要的记录。</p><p>对于我们在SQL语句中常见的WHERE条件，一般 MySQL能够使用如下三种方式应用WHERE条件，从效率和扫描行数多少来评价的话，从好到坏依次为:</p><ol><li>在索引中使用WHERE条件来过滤不匹配的记录。这是在存储引擎层完成的。</li><li>使用索引覆盖扫描（在Extra列中出现了Using index）来返回记录，直接从索引中过滤不需要的记录并返回命中的结果。这是在 MySQL服务器层完成的，但无须再回表查询记录。</li><li>从数据表中返回数据，然后过滤不满足条件的记录（在Extra列中出现Using Where)。这在 MySQL服务器层完成，MySQL需要先从数据表读出记录然后过滤。</li></ol><p>好的索引可以让查询使用合适的访问类型，尽可能地只扫描需要的数据行。如果发现查询需要扫描大量的数据但只返回少数的行，那么通常可以尝试下面的技巧去优化它:</p><ol><li>使用索引覆盖扫描，把所有需要用的列都放到索引中，这样存储引擎无须回表获取对应行就可以返回结果了</li><li>改变库表结构。例如使用单独的汇总表。​</li><li>重写这个复杂的查询，让 MySQL优化器能够以更优化的方式执行这个查询</li></ol><h2 id="重构sql方法" tabindex="-1"><a class="header-anchor" href="#重构sql方法"><span>重构SQL方法</span></a></h2><h3 id="一个复杂查询还是多个简单查询" tabindex="-1"><a class="header-anchor" href="#一个复杂查询还是多个简单查询"><span>一个复杂查询还是多个简单查询</span></a></h3><p>在传统的实现过程中，强调数据库完成尽可能多的工作，这是基于认为网络、查询解析和优化是代价很高的一件事。但这种认知对于mysql不太适用，现在的网络带宽和速率都有较大幅度提高，而mysql的连接和断开都是比较轻量级的，返回一个小的查询很高效。<br> 所以有时候，将一个复杂的查询，拆分成几个小的简单查询，可能效率和性能更好。<br> 不过，在应用设计的时候，如果一个查询能够胜任时还写成多个独立查询是不明智的。例如，应用对一个数据表做10次独立的查询来返回10行数据，每个查询返回一条结果，查询10次这种就不算明智。</p><h3 id="切分查询" tabindex="-1"><a class="header-anchor" href="#切分查询"><span>切分查询</span></a></h3><p>有时候对于一个大查询我们需要“分而治之”，将大查询切分成小查询，每个查询功能完全一样，只完成一小部分，每次只返回一小部分查询结果。</p><p>删除旧的数据就是一个很好的例子。定期地清除大量数据时，如果用一个大的语句一次性完成的话，则可能需要一次锁住很多数据、占满整个事务日志、耗尽系统资源、阻塞很多小的但重要的查询。将一个大的DELETE语句切分成多个较小的查询可以尽可能小地影响MySQL性能，同时还可以减少MySQL复制的延迟。一般来说，将每个SQL所处理的记录控制在5000到10000是个比较好的权衡值。</p><h3 id="分解关联查询" tabindex="-1"><a class="header-anchor" href="#分解关联查询"><span>分解关联查询</span></a></h3><p>很多高性能的应用都会对关联查询进行分解。简单地，可以对每一个表进行一次单表查询，然后将结果在应用程序中进行关联。到底为什么要这样做?乍一看，这样做并没有什么好处，原本一条查询，这里却变成多条查询，返回的结果又是一模一样的。事实上，用分解关联查询的方式重构查询有如下的优势</p><ol><li><strong>让缓存效率更高：</strong> 许多应用程序可以方便地缓存单表查询对应的结果对象。将查询分解后，执行单个查询可以减少锁的竞争。</li><li><strong>更容易的高性能和可扩展性：</strong> 在应用层做关联，可以更容易对数据库进行拆分，<strong>查询本身效率也可能会有所提升。</strong> 传统关系型数据库的横向扩容是很难的，但JAVA程序就不同了，可以很方便的进行横向扩容。</li><li><strong>减少冗余记录的查询：</strong> 多表关联的时候，可能会多次扫描同一条数据。而在程序中关联数据，数据只需扫描一次数据即可。</li><li><strong>在应用中实现哈希关联：</strong> 在应用中关联是在应用中实现了哈希关联，而不是在数据库中使用嵌套循环链接，某些情况或场景下哈希关联效率要高很多。</li></ol><h2 id="mysql执行流程考虑优化" tabindex="-1"><a class="header-anchor" href="#mysql执行流程考虑优化"><span>Mysql执行流程考虑优化</span></a></h2><h3 id="为什么查询速度会慢" tabindex="-1"><a class="header-anchor" href="#为什么查询速度会慢"><span>为什么查询速度会慢</span></a></h3><p>如果把查询看作是一个任务，那么它由一系列子任务组成，每个子任务都会消耗一定的时间。如果要优化查询，实际上要优化其子任务，要么消除其中一些子任务，要么减少子任务的执行次数，要么让子任务运行得更快。在完成这些子任务的时候，查询需要在不同的地方花费时间，包括网络，CPU计算，生成统计信息和执行计划、锁等待（互斥等待）等操作，尤其是向底层存储引擎检索数据的调用操作,这些调用需要在内存操作,CPU操作和内存不足时导致的IO操作上消耗时间。根据存储引擎不同，可能还会产生大量的上下文切换以及系统调用。优化查询的目的就是减少和消除这些操作所花费的时间。</p><h3 id="查询执行流程回顾" tabindex="-1"><a class="header-anchor" href="#查询执行流程回顾"><span>查询执行流程回顾</span></a></h3><p>​<img src="`+c+`" alt="image">​</p><ol><li>客户端发送一条查询给服务器。</li><li>服务器先检查查询缓存，如果命中了缓存，则立刻返回存储在缓存中的结果。否则进入下一阶段（当然从MySQL8.0开始，这个部分就没有了）。</li><li>服务器端进行SQL解析、预处理，再由优化器生成对应的执行计划。</li><li>MySQL根据优化器生成的执行计划，调用存储引擎的API来执行查询。</li><li>将结果返回给客户端。</li></ol><p>所以MySQL查询的生命周期大致可以按照顺序来看:从客户端到服务器，然后在服务器上进行解析，生成执行计划，执行，并返回结果给客户端。其中“执行”可以认为是整个生命周期中最重要的阶段，这其中包括了大量为了检索数据到存储引擎的调用以及调用后的数据处理，包括排序、分组等。</p><h3 id="mysql客户端-服务端通信" tabindex="-1"><a class="header-anchor" href="#mysql客户端-服务端通信"><span>Mysql客户端/服务端通信</span></a></h3><p>一般来说，不需要去理解MySQL通信协议的内部实现细节，只需要大致理解通信协议是如何工作的。MySQL客户端和服务器之间的通信协议是<strong>半双工</strong>的，这意味着，在任何一个时刻，要么是由服务器向客户端发送数据，要么是由客户端向服务器发送数据，这两个动作不能同时发生。所以，我们无法也无须将一个消息切成小块独立来发送。</p><p>这种协议让 MySQL通信简单快速，但是也从很多地方限制了MySQL。一个明显的限制是，这意味着没法进行流量控制。一旦一端开始发生消息，另一端要接收完整个消息才能响应它。这就像来回抛球的游戏﹔在任何时刻，只有一个人能控制球，而且只有控制球的人才能将球抛回去（发送消息)。</p><p>客户端用一个单独的数据包将查询传给服务器。这也是为什么当查询的语句很长的时候，参数max_allowed_packet就特别重要了。一旦客户端发送了请求，它能做的事情就只是等待结果了。</p><p>相反的，一般服务器响应给用户的数据通常很多，由多个数据包组成。当服务器开始响应客户端请求时，客户端必须完整地接收整个返回结果，而不能简单地只取前面几条结果，然后让服务器停止发送数据。这种情况下，客户端若接收完整的结果，然后取前面几条需要的结果，或者接收完几条结果后就“粗暴”地断开连接，都不是好主意。这也是在必要的时候一定要在查询中加上LIMIT限制的原因。</p><p>换一种方式解释这种行为:当客户端从服务器取数据时，看起来是一个拉数据的过程，但实际上是MySQL在向客户端推送数据的过程。客户端不断地接收从服务器推送的数据，客户端也没法让服务器停下来。</p><p>多数连接MySQL 的库函数都可以获得全部结果集并缓存到内存里，还可以逐行获取需要的数据。默认一般是获得全部结果集并缓存到内存中。MySQL通常需要等所有的数据都已经发送给客户端才能释放这条查询所占用的资源，所以接收全部结果并缓存通常可以减少服务器的压力，让查询能够早点结束、早点释放相应的资源。</p><p>当使用库函数从MySQL获取数据时，其结果看起来都像是从MySQL服务器获取数据，而实际上都是从这个库函数的缓存获取数据。多数情况下这没什么问题，但是如果需要返回一个很大的结果集的时候库函数会花很多时间和内存来存储所有的结果集。对于Java程序来说，很有可能发生OOM，所以MySQL的JDBC里提供了setFetchSize() 之类的功能，来解决这个问题：</p><ol><li>当statement设置以下属性时，采用的是流数据接收方式，每次只从服务器接收部份数据，直到所有数据处理完毕，不会发生JVM OOM。</li></ol><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token function">setResultSetType</span><span class="token punctuation">(</span><span class="token class-name">ResultSet</span><span class="token punctuation">.</span><span class="token constant">TYPE_FORWARD_ONLY</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">setFetchSize</span><span class="token punctuation">(</span><span class="token number">1000</span><span class="token punctuation">)</span><span class="token punctuation">;</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>​<code>ResultSetType.FORWARD_ONLY</code>​ 表示游标只向前滚动</li><li>​<code>fetchSize</code>​ 每次获取量</li></ul><ol><li><p>调用statement的enableStreamingResults方法，实际上enableStreamingResults方法内部封装的就是第1种方式。</p></li><li><p>设置连接属性useCursorFetch=true (5.0版驱动开始支持)，statement以TYPE_FORWARD_ONLY打开，再设置fetch size参数，表示采用服务器端游标，每次从服务器取fetch_size条数据。比如</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code>con <span class="token operator">=</span> <span class="token class-name">DriverManager</span><span class="token punctuation">.</span><span class="token function">getConnection</span><span class="token punctuation">(</span>url<span class="token punctuation">)</span><span class="token punctuation">;</span>
ps <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">PreparedStatement</span><span class="token punctuation">)</span> con<span class="token punctuation">.</span><span class="token function">prepareStatement</span><span class="token punctuation">(</span>sql<span class="token punctuation">,</span><span class="token class-name">ResultSet</span><span class="token punctuation">.</span><span class="token constant">TYPE_FORWARD_ONLY</span><span class="token punctuation">,</span><span class="token class-name">ResultSet</span><span class="token punctuation">.</span><span class="token constant">CONCUR_READ_ONLY</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
ps<span class="token punctuation">.</span><span class="token function">setFetchSize</span><span class="token punctuation">(</span><span class="token class-name">Integer</span><span class="token punctuation">.</span><span class="token constant">MIN_VALUE</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
ps<span class="token punctuation">.</span><span class="token function">setFetchDirection</span><span class="token punctuation">(</span><span class="token class-name">ResultSet</span><span class="token punctuation">.</span><span class="token constant">FETCH_REVERSE</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
rs <span class="token operator">=</span> ps<span class="token punctuation">.</span><span class="token function">executeQuery</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">while</span> <span class="token punctuation">(</span>rs<span class="token punctuation">.</span><span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>……实际的业务处理<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>mybatis中可以使用Cursor实现流式查询</p></li></ol><h3 id="生命周期中的查询优化处理" tabindex="-1"><a class="header-anchor" href="#生命周期中的查询优化处理"><span>生命周期中的查询优化处理</span></a></h3><p>查询的生命周期的下一步是将一个SQL转换成一个执行计划，MySQL再依照这个执行计划和存储引擎进行交互。这包括多个子阶段:解析SQL、预处理、优化SQL执行计划。这个过程中任何错误（例如语法错误）都可能终止查询。在实际执行中，这几部分可能一起执行也可能单独执行。</p><p>MySQL的查询优化器是一个非常复杂的部件，它使用了很多优化策略来生成一个最优的执行计划。优化策略可以简单地分为两种，一种是静态优化，一种是动态优化。静态优化可以直接对解析树进行分析，并完成优化。例如，优化器可以通过一些简单的代数变换将WHERE条件转换成另一种等价形式。静态优化不依赖于特别的数值，如WHERE条件中带入的一些常数等。静态优化在第一次完成后就一直有效，即使使用不同的参数重复执行查询也不会发生变化。可以认为这是一种“编译时优化”。</p><p>相反，动态优化则和查询的上下文有关，也可能和很多其他因素有关，例如WHERE条件中的取值、索引中条目对应的数据行数等。这需要在每次查询的时候都重新评估，可以认为这是“运行时优化”。</p><p>优化器是相当复杂性和智能的。建议大家“不要自以为比优化器更聪明”。如果没有必要，不要去干扰优化器的工作，让优化器按照它的方式工作。尽量按照优化器的提示去优化我们的表、索引和SQL语句，比如写查询，或者重新设计更优的库表结构，或者添加更合适的索引。但是请尽可能的保持SQL语句的简洁，SQL语句变得很复杂的情况下，请相信，维护会成为一个地狱。而带来的最终的收益微乎其微。</p><p>当然，虽然优化器已经很智能了，但是有时候也无法给出最优的结果。有时候你可能比优化器更了解数据，例如，由于应用逻辑使得某些条件总是成立﹔还有时，优化器缺少某种功能特性，如哈希索引﹔再如前面提到的，从优化器的执行成本角度评估出来的最优执行计划，实际运行中可能比其他的执行计划更慢。</p><p>如果能够确认优化器给出的不是最佳选择，并且清楚优化背后的原理，那么也可以帮助优化器做进一步的优化。当出现不理想的SQL查询时，我们就需要知道查询优化器是如何工作的，以便有针对性的进行改进，不管是SQL语句本身还是表结构相关，比如索引。这个时候需要仔细耐心的对慢查询进行分析。​</p><h3 id="查询执行引擎" tabindex="-1"><a class="header-anchor" href="#查询执行引擎"><span>查询执行引擎</span></a></h3><p>在解析和优化阶段，MySQL将生成查询对应的执行计划，MySQL的查询执行引擎则根据这个执行计划来完成整个查询。相对于查询优化阶段，查询执行阶段不是那么复杂：MySQL 只是简单地根据执行计划给出的指令逐步执行。</p><h3 id="返回结果给客户端" tabindex="-1"><a class="header-anchor" href="#返回结果给客户端"><span>返回结果给客户端</span></a></h3><p>查询执行的最后一个阶段是将结果返回给客户端。即使查询不需要返回结果集给客户端，MySQL仍然会返回这个查询的一些信息，如该查询影响到的行数。如果查询可以被缓存，那么MySQL在这个阶段也会将结果存放到查询缓存中。MySQL将结果集返回客户端是一个增量、逐步返回的过程。一旦服务器开始生成第一条结果时，MySQL就可以开始向客户端逐步返回结果集了。</p><div class="hint-container tip"><p class="hint-container-title">好处</p><p>这样处理有两个好处﹔服务器端无须存储太多的结果，也就不会因为要返回太多结果而消耗太多内存。另外，这样的处理也让 MySQL客户端第一时间获得返回的结果。结果集中的每一行都会以一个满足MySQL客户端/服务器通信协议的封包发送，再通过TCP协议进行传输，在TCP传输的过程中，可能对MySQL的封包进行缓存然后批量传输。</p></div><h3 id="查询状态" tabindex="-1"><a class="header-anchor" href="#查询状态"><span>查询状态</span></a></h3><p>对于一个MySQL连接，或者说一个线程，任何时刻都有一个状态，该状态表示了MySQL当前正在做什么。在一个查询的生命周期中，状态会变化很多次。</p><h4 id="通过show-processlist分析sql" tabindex="-1"><a class="header-anchor" href="#通过show-processlist分析sql"><span>通过show processlist分析SQL</span></a></h4><p>当我们通过应用程序访问MySQL服务时，有时候性能不一定全部卡在语句的执行上。当然通过慢查询日志定位那些执行效率较低的SQL语句时候我们常用的手段，但是</p><ul><li>慢查询日志在查询结束以后才记录，在应用反映执行效率出现问题的时候查询未必执行完成</li><li>有时候问题的产生不一定是语句的执行，有可能是其他原因导致的。慢查询日志并不能定位问题。</li></ul><p>这个时候通过<strong>show processlist</strong>查看线程状态非常有用,这可以让我们很快地了解当前MySQL在进行的线程,包括线程的状态、是否锁表等，可以实时地查看SQL 的执行情况，同时对一些锁表操作进行优化。在一个繁忙的服务器上，可能会看到大量的不正常的状态，例如statistics正占用大量的时间。这通常表示，某个地方有异常了。</p>`,78),k={class:"hint-container tip"},v=s("p",{class:"hint-container-title"},"线程状态",-1),q=s("ul",null,[s("li",null,[s("strong",null,"statistics："),n(" 服务器正在计算统计信息以研究一个查询执行计划。如果线程长时间处于此状态，则服务器可能是磁盘绑定执行其他工作")]),s("li",null,[s("strong",null,"Creating tmp table："),n(" 该线程正在内存或磁盘上创建临时表。如果表在内存中创建但稍后转换为磁盘表，则该操作期间的状态将为 Copying to tmp table on disk")]),s("li",null,[s("strong",null,"Sending data："),n(" 线程正在读取和处理 SELECT 语句的行，并将数据发送到客户端。由于在此状态期间发生的操作往往会执行大量磁盘访问（读取），因此它通常是给定查询生命周期中运行时间最长的状态")])],-1),b={href:"https://dev.mysql.com/doc/refman/8.0/en/general-thread-states.html",target:"_blank",rel:"noopener noreferrer"},S=a(`<h4 id="通过show-profile分析" tabindex="-1"><a class="header-anchor" href="#通过show-profile分析"><span>通过show profile分析</span></a></h4><p>对于每个线程到底时间花在哪里，可以通过show profile来分析。</p><p>1.首先检查当前Mysql是否支持profile</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">select</span> @<span class="token variable">@have_profiling</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>​<img src="`+r+`" alt="image">​</p><p>2.默认profiling是关闭的，可以通过set语句在 Session级别开启 profiling</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">select</span> @<span class="token variable">@profiling</span><span class="token punctuation">;</span>
<span class="token keyword">set</span> profiling<span class="token operator">=</span><span class="token number">1</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>​<img src="`+d+`" alt="image">​</p><p>3.执行一个sql查询</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">select</span> <span class="token function">count</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token keyword">from</span> order_exp<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>4.通过show profiles语句，看到当前SQL的Query ID</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">show</span> profiles<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>​<img src="`+u+`" alt="image">​</p><p>5.通过show profile for query语句能够看到执行过程中线程的每个状态和消耗的时间</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">show</span> profile <span class="token keyword">for</span> query <span class="token number">1</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>​<img src="`+m+`" alt="image">​</p><p>通过仔细检查show profile for query 的输出，能够发现在执行COUNT(*)的过程中，时间主要消耗在 Sending data这个状态上。</p><p>6.在获取到最消耗时间的线程状态后，MySQL 支持进一步选择all、cpu、block io、contextswitch、page faults等明细类型来查看MySQL在使用什么资源上耗费了过高的时间:</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">show</span> profile <span class="token keyword">all</span> <span class="token keyword">for</span> query <span class="token number">1</span>\\G
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>​<img src="`+h+'" alt="image">​</p><p>能够发现Sending data状态下，时间主要消耗在 CPU上了。所以show profile能够在做SQL优化时帮助我们了解时间都耗费到哪里去了。</p><p>‍</p>',22);function L(_,M){const e=t("ExternalLinkIcon");return p(),i("div",null,[y,s("div",k,[v,q,s("p",null,[n("其余状态可以参考"),s("a",b,[n("MySQL :: MySQL 8.0 Reference Manual :: 10.14.3 General Thread States"),o(e)])])]),S])}const x=l(g,[["render",L],["__file","08-全局理解Mysql性能优化.html.vue"]]),w=JSON.parse(`{"path":"/statudy/Mysql/08-%E5%85%A8%E5%B1%80%E7%90%86%E8%A7%A3Mysql%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96.html","title":"08-全局理解Mysql性能优化","lang":"zh-CN","frontmatter":{"title":"08-全局理解Mysql性能优化","order":7,"date":"2024-04-18T00:00:00.000Z","category":["Mysql"],"tag":["Mysql"],"description":"Mysql慢查询日志 慢查询日志，顾名思义，就是查询花费大量时间的日志，是指mysql记录所有执行超过long_query_time参数设定的时间阈值的SQL语句的日志。该日志能为SQL语句的优化带来很好的帮助。默认情况下，慢查询日志是关闭的，要使用慢查询日志功能，首先要开启慢查询日志功能。 多少时间算慢查询，mysql中有一个参数作为阈值，运行时间超...","head":[["meta",{"property":"og:url","content":"https://xsyl06.github.io/myblog/myblog/statudy/Mysql/08-%E5%85%A8%E5%B1%80%E7%90%86%E8%A7%A3Mysql%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96.html"}],["meta",{"property":"og:site_name","content":"Xsyl06的博客"}],["meta",{"property":"og:title","content":"08-全局理解Mysql性能优化"}],["meta",{"property":"og:description","content":"Mysql慢查询日志 慢查询日志，顾名思义，就是查询花费大量时间的日志，是指mysql记录所有执行超过long_query_time参数设定的时间阈值的SQL语句的日志。该日志能为SQL语句的优化带来很好的帮助。默认情况下，慢查询日志是关闭的，要使用慢查询日志功能，首先要开启慢查询日志功能。 多少时间算慢查询，mysql中有一个参数作为阈值，运行时间超..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240417102513-4dzhcn8.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-23T14:47:48.000Z"}],["meta",{"property":"article:author","content":"xsyl06"}],["meta",{"property":"article:tag","content":"Mysql"}],["meta",{"property":"article:published_time","content":"2024-04-18T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-04-23T14:47:48.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"08-全局理解Mysql性能优化\\",\\"image\\":[\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240417102513-4dzhcn8.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240417141345-anbbmj8.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240417141435-znemzpm.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240417141525-mwhgcod.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240417141551-glktq9u.png\\",\\"https://xsyl06.github.io/myblog/myblog/assets/img/image-20240417141649-z1m1zw1.png\\"],\\"datePublished\\":\\"2024-04-18T00:00:00.000Z\\",\\"dateModified\\":\\"2024-04-23T14:47:48.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"xsyl06\\",\\"url\\":\\"https://gitee.com/xsyl06\\"}]}"]]},"headers":[{"level":2,"title":"Mysql慢查询日志","slug":"mysql慢查询日志","link":"#mysql慢查询日志","children":[]},{"level":2,"title":"优化SQL查询方法","slug":"优化sql查询方法","link":"#优化sql查询方法","children":[{"level":3,"title":"业务层请求了不需要的数据","slug":"业务层请求了不需要的数据","link":"#业务层请求了不需要的数据","children":[{"level":4,"title":"查询出不需要的行","slug":"查询出不需要的行","link":"#查询出不需要的行","children":[]},{"level":4,"title":"总是查询出所有的列","slug":"总是查询出所有的列","link":"#总是查询出所有的列","children":[]}]},{"level":3,"title":"执行层是否存在额外记录的扫描","slug":"执行层是否存在额外记录的扫描","link":"#执行层是否存在额外记录的扫描","children":[{"level":4,"title":"响应时间","slug":"响应时间","link":"#响应时间","children":[]},{"level":4,"title":"扫描行数和返回行数","slug":"扫描行数和返回行数","link":"#扫描行数和返回行数","children":[]}]}]},{"level":2,"title":"重构SQL方法","slug":"重构sql方法","link":"#重构sql方法","children":[{"level":3,"title":"一个复杂查询还是多个简单查询","slug":"一个复杂查询还是多个简单查询","link":"#一个复杂查询还是多个简单查询","children":[]},{"level":3,"title":"切分查询","slug":"切分查询","link":"#切分查询","children":[]},{"level":3,"title":"分解关联查询","slug":"分解关联查询","link":"#分解关联查询","children":[]}]},{"level":2,"title":"Mysql执行流程考虑优化","slug":"mysql执行流程考虑优化","link":"#mysql执行流程考虑优化","children":[{"level":3,"title":"为什么查询速度会慢","slug":"为什么查询速度会慢","link":"#为什么查询速度会慢","children":[]},{"level":3,"title":"查询执行流程回顾","slug":"查询执行流程回顾","link":"#查询执行流程回顾","children":[]},{"level":3,"title":"Mysql客户端/服务端通信","slug":"mysql客户端-服务端通信","link":"#mysql客户端-服务端通信","children":[]},{"level":3,"title":"生命周期中的查询优化处理","slug":"生命周期中的查询优化处理","link":"#生命周期中的查询优化处理","children":[]},{"level":3,"title":"查询执行引擎","slug":"查询执行引擎","link":"#查询执行引擎","children":[]},{"level":3,"title":"返回结果给客户端","slug":"返回结果给客户端","link":"#返回结果给客户端","children":[]},{"level":3,"title":"查询状态","slug":"查询状态","link":"#查询状态","children":[{"level":4,"title":"通过show processlist分析SQL","slug":"通过show-processlist分析sql","link":"#通过show-processlist分析sql","children":[]},{"level":4,"title":"通过show profile分析","slug":"通过show-profile分析","link":"#通过show-profile分析","children":[]}]}]}],"git":{"createdTime":1713883668000,"updatedTime":1713883668000,"contributors":[{"name":"Wang","email":"xsyl06@qq.com","commits":1}]},"readingTime":{"minutes":20.27,"words":6081},"filePathRelative":"statudy/Mysql/08-全局理解Mysql性能优化.md","localizedDate":"2024年4月18日","excerpt":"<h2>Mysql慢查询日志</h2>\\n<p>慢查询日志，顾名思义，就是查询花费大量时间的日志，是指mysql记录所有执行超过long_query_time参数设定的时间阈值的SQL语句的日志。该日志能为SQL语句的优化带来很好的帮助。默认情况下，慢查询日志是关闭的，要使用慢查询日志功能，首先要开启慢查询日志功能。</p>\\n<div class=\\"language-sql\\" data-ext=\\"sql\\" data-title=\\"sql\\"><pre class=\\"language-sql\\"><code><span class=\\"token keyword\\">show</span> VARIABLES <span class=\\"token operator\\">like</span> <span class=\\"token string\\">'slow_query_log'</span><span class=\\"token punctuation\\">;</span>\\n<span class=\\"token comment\\">#开启慢查询日志</span>\\n<span class=\\"token keyword\\">set</span> <span class=\\"token keyword\\">GLOBAL</span> slow_query_log<span class=\\"token operator\\">=</span><span class=\\"token number\\">1</span><span class=\\"token punctuation\\">;</span>\\n</code></pre></div>","autoDesc":true}`);export{x as comp,w as data};
