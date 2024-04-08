import{_ as e}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as t,c as i,a}from"./app-B837ZDW-.js";const l="/xsyl06/assets/img/image-20240219224259-1900g0v.png",s="/xsyl06/assets/img/image-20240219223921-xvwg45u.png",o={},n=a('<h1>01-JVM内存模型</h1><h1 id="一、类加载机制" tabindex="-1"><a class="header-anchor" href="#一、类加载机制"><span>一、类加载机制</span></a></h1><p>​<img src="'+l+'" alt="image" loading="lazy">​</p><h1 id="二、jvm相关参数" tabindex="-1"><a class="header-anchor" href="#二、jvm相关参数"><span>二、JVM相关参数</span></a></h1><p>​<img src="'+s+'" alt="image" loading="lazy">​</p><ul><li>-Xss：每个线程的栈大小</li><li>-Xms：设置堆的初始可用大小，默认物理内存的1/64</li><li>-Xmx：设置堆的最大可用大小，默认物理内存的1/4</li><li>-Xmn：新生代大小</li><li>-XX:NewRatio：默认2表示新生代占年老代的1/2，占整个堆内存的1/3</li><li>-XX:SurvivorRatio：默认8表示一个survivor区占用1/8的Eden内存，即1/10的新生代内存</li></ul><p>元空间设置参数有两个：</p><ul><li>-XX:MaxMetaspaceSize ：元空间最大值，默认-1，不限制，只受限于本地物理内存大小</li><li>-XX:MetaspaceSiz：指定元空间触发Fullgc的初始阈值(元空间无固定初始大小)， 以字节为单位，默认是21M左右，达到该值就会触发full gc进行类型卸载， 同时收集器会对该值进行调整： 如果释放了大量的空间， 就适当降低该值； 如果释放了很少的空间， 那么在不超过-XX：MaxMetaspaceSize（如果设置了的话） 的情况下， 适当提高该值。这个跟早期jdk版本的-XX:PermSize参数意思不一样，-XX:PermSize代表永久代的初始容量。</li></ul><p>由于调整元空间大小需要Fullgc，很耗费开销。在应用启动过程中发生大量Fullgc，通常是元空间发生了大小调整，基于这种情况，一般建议将JVM参数-XX:MaxMetaspaceSize和-XX:MetaspaceSize设置成一样的值，并且设置的比初始值要大，对于8G内存的系统来说，一般可以设置成256M。</p><p>‍</p>',10),r=[n];function m(p,c){return t(),i("div",null,r)}const h=e(o,[["render",m],["__file","01-JVM内存模型.html.vue"]]),X=JSON.parse('{"path":"/statudy/JVM/01-JVM%E5%86%85%E5%AD%98%E6%A8%A1%E5%9E%8B.html","title":"01-JVM内存模型","lang":"zh-CN","frontmatter":{"title":"01-JVM内存模型","order":1,"date":"2024-03-29T00:00:00.000Z","category":["JVM"],"tag":["JVM"],"description":"01-JVM内存模型 一、类加载机制 ​image​ 二、JVM相关参数 ​image​ -Xss：每个线程的栈大小 -Xms：设置堆的初始可用大小，默认物理内存的1/64 -Xmx：设置堆的最大可用大小，默认物理内存的1/4 -Xmn：新生代大小 -XX:NewRatio：默认2表示新生代占年老代的1/2，占整个堆内存的1/3 -XX:Survivo...","head":[["meta",{"property":"og:url","content":"https://xsyl06.github.io/xsyl06/xsyl06/statudy/JVM/01-JVM%E5%86%85%E5%AD%98%E6%A8%A1%E5%9E%8B.html"}],["meta",{"property":"og:site_name","content":"Xsyl06的博客"}],["meta",{"property":"og:title","content":"01-JVM内存模型"}],["meta",{"property":"og:description","content":"01-JVM内存模型 一、类加载机制 ​image​ 二、JVM相关参数 ​image​ -Xss：每个线程的栈大小 -Xms：设置堆的初始可用大小，默认物理内存的1/64 -Xmx：设置堆的最大可用大小，默认物理内存的1/4 -Xmn：新生代大小 -XX:NewRatio：默认2表示新生代占年老代的1/2，占整个堆内存的1/3 -XX:Survivo..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://xsyl06.github.io/xsyl06/xsyl06/assets/img/image-20240219224259-1900g0v.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-08T07:58:12.000Z"}],["meta",{"property":"article:author","content":"xsyl06"}],["meta",{"property":"article:tag","content":"JVM"}],["meta",{"property":"article:published_time","content":"2024-03-29T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-04-08T07:58:12.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"01-JVM内存模型\\",\\"image\\":[\\"https://xsyl06.github.io/xsyl06/xsyl06/assets/img/image-20240219224259-1900g0v.png\\",\\"https://xsyl06.github.io/xsyl06/xsyl06/assets/img/image-20240219223921-xvwg45u.png\\"],\\"datePublished\\":\\"2024-03-29T00:00:00.000Z\\",\\"dateModified\\":\\"2024-04-08T07:58:12.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"xsyl06\\",\\"url\\":\\"https://gitee.com/xsyl06\\"}]}"]]},"headers":[{"level":1,"title":"一、类加载机制","slug":"一、类加载机制","link":"#一、类加载机制","children":[]},{"level":1,"title":"二、JVM相关参数","slug":"二、jvm相关参数","link":"#二、jvm相关参数","children":[]}],"git":{"createdTime":1711709881000,"updatedTime":1712563092000,"contributors":[{"name":"Wang","email":"xsyl06@qq.com","commits":3}]},"readingTime":{"minutes":1.43,"words":430},"filePathRelative":"statudy/JVM/01-JVM内存模型.md","localizedDate":"2024年3月29日","excerpt":"\\n<h1>一、类加载机制</h1>\\n<p>​<img src=\\"/assets/img/image-20240219224259-1900g0v.png\\" alt=\\"image\\" loading=\\"lazy\\">​</p>\\n<h1>二、JVM相关参数</h1>\\n<p>​<img src=\\"/assets/img/image-20240219223921-xvwg45u.png\\" alt=\\"image\\" loading=\\"lazy\\">​</p>\\n<ul>\\n<li>-Xss：每个线程的栈大小</li>\\n<li>-Xms：设置堆的初始可用大小，默认物理内存的1/64</li>\\n<li>-Xmx：设置堆的最大可用大小，默认物理内存的1/4</li>\\n<li>-Xmn：新生代大小</li>\\n<li>-XX:NewRatio：默认2表示新生代占年老代的1/2，占整个堆内存的1/3</li>\\n<li>-XX:SurvivorRatio：默认8表示一个survivor区占用1/8的Eden内存，即1/10的新生代内存</li>\\n</ul>","autoDesc":true}');export{h as comp,X as data};
