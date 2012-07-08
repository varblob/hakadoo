/*! fancyBox v2.0.6 fancyapps.com | fancyapps.com/fancybox/#license */
(function(u,x,f,s){var p=f(u),o=f(x),b=f.fancybox=function(){b.open.apply(this,arguments)},y=!1,r=x.createTouch!==s,F=function(a){return a&&a.hasOwnProperty&&a instanceof f},q=function(a){return a&&"string"===f.type(a)},B=function(a){return q(a)&&0<a.indexOf("%")},m=function(a,c){c&&B(a)&&(a=b.getViewport()[c]/100*parseInt(a,10));return Math.ceil(a)},v=function(a,b){return m(a,b)+"px"};f.extend(b,{version:"2.0.6",defaults:{padding:15,margin:20,width:800,height:600,minWidth:100,minHeight:100,maxWidth:9999,
maxHeight:9999,autoSize:!0,autoHeight:!1,autoWidth:!1,autoResize:!r,autoCenter:!r,fitToView:!0,aspectRatio:!1,topRatio:0.5,fixed:!1,scrolling:"auto",wrapCSS:"",arrows:!0,closeBtn:!0,closeClick:!1,nextClick:!1,mouseWheel:!0,autoPlay:!1,playSpeed:3E3,preload:3,modal:!1,loop:!0,ajax:{dataType:"html",headers:{"X-fancyBox":!0}},iframe:{scrolling:"auto",preload:!0},swf:{wmode:"transparent",allowfullscreen:"true",allowscriptaccess:"always"},keys:{next:{13:"right",34:"down",39:"right",40:"down"},prev:{8:"left",
33:"up",37:"left",38:"up"},close:[27],play:[32],toggle:[70]},index:0,tpl:{wrap:'<div class="fancybox-wrap"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',image:'<img class="fancybox-image" src="{href}" alt="" />',iframe:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0"'+(f.browser.msie?' allowtransparency="true"':"")+"></iframe>",error:'<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
closeBtn:'<div title="Close" class="fancybox-item fancybox-close"></div>',next:'<a title="Next" class="fancybox-nav fancybox-next"><span></span></a>',prev:'<a title="Previous" class="fancybox-nav fancybox-prev"><span></span></a>'},openEffect:"fade",openSpeed:250,openEasing:"swing",openOpacity:!0,openMethod:"zoomIn",closeEffect:"fade",closeSpeed:250,closeEasing:"swing",closeOpacity:!0,closeMethod:"zoomOut",nextEffect:"elastic",nextSpeed:250,nextEasing:"swing",nextMethod:"changeIn",prevEffect:"elastic",
prevSpeed:250,prevEasing:"swing",prevMethod:"changeOut",helpers:{overlay:{speedIn:0,speedOut:250,opacity:0.8,css:{cursor:"pointer"},closeClick:!0},title:{type:"float"}}},group:{},opts:{},previous:null,coming:null,current:null,isActive:!1,isOpen:!1,isOpened:!1,player:{timer:null,isActive:!1},transitions:{},helpers:{},open:function(a,c){if(a)return c=f.isPlainObject(c)?c:{},b.close(!0),f.isArray(a)||(a=F(a)?f(a).get():[a]),f.each(a,function(e,d){var j={},h,g,i,k,l;"object"===f.type(d)&&(d.nodeType&&
(d=f(d)),F(d)?(j={href:d.attr("href"),title:d.attr("title"),isDom:!0,element:d},f.metadata&&f.extend(!0,j,d.metadata())):j=d);h=c.href||j.href||(q(d)?d:null);g=c.title!==s?c.title:j.title||"";k=(i=c.content||j.content)?"html":c.type||j.type;!k&&j.isDom&&(k=d.data("fancybox-type"),k||(k=(k=d.prop("class").match(/fancybox\.(\w+)/))?k[1]:null));if(q(h)&&(k||(b.isImage(h)?k="image":b.isSWF(h)?k="swf":h.match(/^#/)?k="inline":q(d)&&(k="html",i=d)),"ajax"===k))l=h.split(/\s+/,2),h=l.shift(),l=l.shift();
i||("inline"===k?h?i=f(q(h)?h.replace(/.*(?=#[^\s]+$)/,""):h):j.isDom&&(i=d):"html"===k?i=h:!k&&(!h&&j.isDom)&&(k="inline",i=d));f.extend(j,{href:h,type:k,content:i,title:g,selector:l});a[e]=j}),b.opts=f.extend(!0,{},b.defaults,c),c.keys!==s&&(b.opts.keys=c.keys?f.extend({},b.defaults.keys,c.keys):!1),b.group=a,b._start(b.opts.index||0)},cancel:function(){var a=b.coming;a&&!1!==b.trigger("onCancel")&&(b.hideLoading(),a.wrap&&a.wrap.stop().trigger("onReset").remove(),b.coming=null,b.ajaxLoad&&b.ajaxLoad.abort(),
b.ajaxLoad=null,b.imgPreload&&(b.imgPreload.onload=b.imgPreload.onerror=null))},close:function(a){b.cancel();b.current&&!1!==b.trigger("beforeClose")&&(b.unbindEvents(),!b.isOpen||!0===a?(f(".fancybox-wrap").stop().trigger("onReset").remove(),b._afterZoomOut()):(b.isOpen=b.isOpened=!1,b.isClosing=!0,f(".fancybox-item, .fancybox-nav").remove(),b.wrap.stop(!0).removeClass("fancybox-opened"),"fixed"===b.wrap.css("position")&&b.wrap.css(b._getPosition(!0)),b.transitions[b.current.closeMethod]()))},play:function(a){var c=
function(){clearTimeout(b.player.timer)},e=function(){c();b.current&&b.player.isActive&&(b.player.timer=setTimeout(b.next,b.current.playSpeed))},d=function(){c();f("body").unbind(".player");b.player.isActive=!1;b.trigger("onPlayEnd")};if(!0===a||!b.player.isActive&&!1!==a){if(b.current&&(b.current.loop||b.current.index<b.group.length-1))b.player.isActive=!0,f("body").bind({"afterShow.player onUpdate.player":e,"onCancel.player beforeClose.player":d,"beforeLoad.player":c}),e(),b.trigger("onPlayStart")}else d()},
next:function(a){q(a)||(a="down");b.current&&b.jumpto(b.current.index+1,a,"next")},prev:function(a){q(a)||(a="up");b.current&&b.jumpto(b.current.index-1,a,"prev")},jumpto:function(a,c,e){var d=b.current;if(d&&(a=parseInt(a,10),b.direction=c||(a>d.index?"right":"left"),b.router=e||"jumpto",d.loop&&(0>a&&(a=d.group.length+a%d.group.length),a%=d.group.length),d.group[a]!==s))b.cancel(),b._start(a)},reposition:function(a,c){var e;b.isOpen&&(e=b._getPosition(c),a&&"scroll"===a.type?(delete e.position,
b.wrap.stop(!0,!0).animate(e,200)):b.wrap.css(e))},update:function(a){var c=!a||a&&"orientationchange"===a.type,e=a&&"scroll"===a.type;c&&(clearTimeout(y),y=null);b.isOpen&&!y&&(c&&r&&(b.wrap.removeAttr("style").addClass("fancybox-tmp"),b.trigger("onUpdate")),y=setTimeout(function(){var d=b.current;y=null;if(d){b.wrap.removeClass("fancybox-tmp");if(d.autoResize&&!e||c){b._setDimension();b.trigger("onUpdate")}(d.autoCenter&&(!e||!d.canShrink)||c)&&b.reposition(a);b.trigger("onUpdate")}},c?20:300))},
toggle:function(a){b.isOpen&&(b.current.fitToView="boolean"===f.type(a)?a:!b.current.fitToView,b.update())},hideLoading:function(){o.unbind("keypress.fb");f("#fancybox-loading").remove()},showLoading:function(){var a,c;b.hideLoading();o.bind("keypress.fb",function(a){if(27===(a.which||a.keyCode))a.preventDefault(),b.cancel()});a=f('<div id="fancybox-loading"><div></div></div>').click(b.cancel).appendTo("body");b.coming&&!b.coming.fixed&&(c=b.getViewport(),a.css({position:"absolute",top:0.5*c.h+c.y,
left:0.5*c.w+c.x}))},getViewport:function(){return{x:p.scrollLeft(),y:p.scrollTop(),w:r&&u.innerWidth?u.innerWidth:p.width(),h:r&&u.innerHeight?u.innerHeight:p.height()}},unbindEvents:function(){b.wrap&&b.wrap.unbind(".fb");o.unbind(".fb");p.unbind(".fb")},bindEvents:function(){var a=b.current,c;a&&(p.bind("resize.fb orientationchange.fb"+(a.autoCenter&&!a.fixed?" scroll.fb":""),b.update),(c=a.keys)&&o.bind("keydown.fb",function(e){var d=e.which||e.keyCode,j=e.target||e.srcElement;!e.ctrlKey&&(!e.altKey&&
!e.shiftKey&&!e.metaKey&&(!j||!j.type&&!f(j).is("[contenteditable]")))&&f.each(c,function(c,g){if(1<a.group.length&&g[d]!==s)return b[c](g[d]),e.preventDefault(),!1;if(-1<f.inArray(d,g))return b[c](),e.preventDefault(),!1})}),f.fn.mousewheel&&a.mouseWheel&&b.wrap.bind("mousewheel.fb",function(c,d,j,h){for(var g=f(c.target||null),i=!1;g.length&&!i&&!g.is(".fancybox-skin")&&!g.is(".fancybox-wrap");)i=g[0]&&!(g[0].style.overflow&&"hidden"===g[0].style.overflow)&&(g[0].clientWidth&&g[0].scrollWidth>g[0].clientWidth||
g[0].clientHeight&&g[0].scrollHeight>g[0].clientHeight),g=f(g).parent();if(0!==d&&!i)if(1<b.group.length&&!a.canShrink){if(0<h||0<j)b.prev(0<h?"up":"left");else if(0>h||0>j)b.next(0>h?"down":"right");c.preventDefault()}else"fixed"===b.wrap.css("position")&&c.preventDefault()}))},trigger:function(a,c){var e,d=c||b[-1<f.inArray(a,["onCancel","beforeLoad","afterLoad"])?"coming":"current"];if(d){f.isFunction(d[a])&&(e=d[a].apply(d,Array.prototype.slice.call(arguments,1)));if(!1===e)return!1;d.helpers&&
f.each(d.helpers,function(c,e){if(e&&b.helpers[c]&&f.isFunction(b.helpers[c][a]))b.helpers[c][a](e,d)});f.event.trigger(a+".fb")}},isImage:function(a){return q(a)&&a.match(/\.(jp(e|g|eg)|gif|png|bmp|webp)((\?|#).*)?$/i)},isSWF:function(a){return q(a)&&a.match(/\.(swf)((\?|#).*)?$/i)},_start:function(a){var c={},c=b.group[a]||null,e,d;if(!c)return!1;c=f.extend(!0,{},b.opts,c);e=c.margin;"number"===f.type(e)&&(c.margin=[e,e,e,e]);c.modal&&f.extend(!0,c,{closeBtn:!1,closeClick:!1,nextClick:!1,arrows:!1,
mouseWheel:!1,keys:null,helpers:{overlay:{css:{cursor:"auto"},closeClick:!1}}});c.autoSize&&(c.autoWidth=c.autoHeight=!0);"auto"===c.width&&(c.autoWidth=!0);"auto"===c.height&&(c.autoHeight=!0);c.group=b.group;c.index=a;b.coming=c;if(!1===b.trigger("beforeLoad"))b.coming=null;else{d=c.type;e=c.href;if(!d)return b.coming=null,b.current&&b.router&&"jumpto"!==b.router?(b.current.index=a,b[b.router](b.direction)):!1;b.isActive=!0;if("image"===d||"swf"===d)c.autoHeight=c.autoWidth=!1,c.scrolling="visible";
"image"===d&&(c.aspectRatio=!0);"iframe"===d&&r&&(c.scrolling="scroll");c.wrap=f(c.tpl.wrap).addClass("fancybox-"+(r?"mobile":"desktop")+" fancybox-type-"+d+" fancybox-tmp "+c.wrapCSS).appendTo(c.parent);f.extend(c,{skin:f(".fancybox-skin",c.wrap).css("padding",v(c.padding)),outer:f(".fancybox-outer",c.wrap),inner:f(".fancybox-inner",c.wrap)});if("inline"===d||"html"===d){if(!c.content||!c.content.length)return b._error("content")}else if(!e)return b._error("href");"image"===d?b._loadImage():"ajax"===
d?b._loadAjax():"iframe"===d?b._loadIframe():b._afterLoad()}},_error:function(a){f.extend(b.coming,{type:"html",autoWidth:!0,autoHeight:!0,minWidth:0,minHeight:0,scrolling:"no",hasError:a,content:b.coming.tpl.error});b._afterLoad()},_loadImage:function(){var a=b.imgPreload=new Image;a.onload=function(){this.onload=this.onerror=null;b.coming.width=this.width;b.coming.height=this.height;b._afterLoad()};a.onerror=function(){this.onload=this.onerror=null;b._error("image")};a.src=b.coming.href;(a.complete===
s||!a.complete)&&b.showLoading()},_loadAjax:function(){var a=b.coming;b.showLoading();b.ajaxLoad=f.ajax(f.extend({},a.ajax,{url:a.href,error:function(a,e){b.coming&&"abort"!==e?b._error("ajax",a):b.hideLoading()},success:function(c,e){"success"===e&&(a.content=c,b._afterLoad())}}))},_loadIframe:function(){var a=b.coming,c=f(a.tpl.iframe.replace(/\{rnd\}/g,(new Date).getTime())).attr("scrolling",r?"auto":a.iframe.scrolling).attr("src",a.href);f(a.wrap).bind("onReset",function(){try{c.hide().parent().empty()}catch(a){}});
a.iframe.preload&&(b.showLoading(),c.bind("load",function(){f(this).unbind().bind("load.fb",b.update).data("ready",1);b.coming.wrap.removeClass("fancybox-tmp").show();b._afterLoad()}));a.content=c.appendTo(a.inner);a.iframe.preload||b._afterLoad()},_preloadImages:function(){var a=b.group,c=b.current,e=a.length,d=c.preload?Math.min(c.preload,e-1):0,f,h;for(h=1;h<=d;h+=1)f=a[(c.index+h)%e],"image"===f.type&&f.href&&((new Image).src=f.href)},_afterLoad:function(){var a=b.coming,c=b.current,e,d,j,h,g;
b.hideLoading();if(!a||!1===b.trigger("afterLoad",a,c))b.coming.wrap.stop().trigger("onReset").remove(),b.coming=null;else{c&&(b.trigger("beforeChange",c),c.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove(),"fixed"===c.wrap.css("position")&&c.wrap.css(b._getPosition(!0)));b.unbindEvents();e=a.content;d=a.type;j=a.scrolling;f.extend(b,{wrap:a.wrap,skin:a.skin,outer:a.outer,inner:a.inner,current:a,previous:c});h=a.href;switch(d){case "inline":case "ajax":case "html":a.selector?
e=f("<div>").html(e).find(a.selector):F(e)&&(e=e.show().detach(),a.wrap.bind("onReset",function(){f(this).find(".fancybox-inner").children().appendTo(a.parent).hide()}));break;case "image":e=a.tpl.image.replace("{href}",h);break;case "swf":e='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="'+h+'"></param>',g="",f.each(a.swf,function(a,b){e=e+('<param name="'+a+'" value="'+b+'"></param>');g=g+(" "+a+'="'+b+'"')}),e+='<embed src="'+
h+'" type="application/x-shockwave-flash" width="100%" height="100%"'+g+"></embed></object>"}"iframe"===a.type&&a.iframe.preload||a.inner.append(e);b.trigger("beforeShow");b._setDimension();a.wrap.removeClass("fancybox-tmp");a.inner.css("overflow","yes"===j?"scroll":"no"===j?"hidden":j);a.pos=f.extend({},a.dim,b._getPosition(!0));b.isOpen=!1;b.coming=null;b.bindEvents();if(b.isOpened){if(c.prevMethod)b.transitions[c.prevMethod]()}else f(".fancybox-wrap").not(a.wrap).stop().trigger("onReset").remove();
b.transitions[b.isOpened?a.nextMethod:a.openMethod]();b._preloadImages()}},_setDimension:function(){var a=b.getViewport(),c=0,e=!1,d=!1,e=b.wrap,j=b.skin,h=b.inner,g=b.current,d=g.width,i=g.height,k=g.minWidth,l=g.minHeight,n=g.maxWidth,t=g.maxHeight,r=g.scrolling,q=g.scrollOutside,w=g.margin,o=w[1]+w[3],p=w[0]+w[2],x,s,u,A,z,D,y,C,E;e.add(j).add(h).width("auto").height("auto");w=j.outerWidth(!0)-j.width();x=j.outerHeight(!0)-j.height();s=o+w;u=p+x;A=B(d)?(a.w-s)*parseFloat(d)/100:d;z=B(i)?(a.h-u)*
parseFloat(i)/100:i;if("iframe"===g.type){if(E=g.content,g.autoHeight&&1===E.data("ready"))try{E[0].contentWindow.document.location&&(h.width(A).height(9999),D=E.contents().find("body"),q&&D.css("overflow-x","hidden"),z=D.height())}catch(F){}}else if(g.autoWidth||g.autoHeight)h.addClass("fancybox-tmp"),g.autoWidth&&(A=h.width()),g.autoHeight&&(z=h.height()),h.removeClass("fancybox-tmp");d=m(A);i=m(z);C=A/z;k=m(B(k)?m(k,"w")-s:k);n=m(B(n)?m(n,"w")-s:n);l=m(B(l)?m(l,"h")-u:l);t=m(B(t)?m(t,"h")-u:t);
D=n;y=t;o=a.w-o;p=a.h-p;if(g.aspectRatio){if(d>n&&(d=n,i=d/C),i>t&&(i=t,d=i*C),d<k&&(d=k,i=d/C),i<l)i=l,d=i*C}else d=Math.max(k,Math.min(d,n)),i=Math.max(l,Math.min(i,t));if(g.fitToView)if(Math.min(a.w-s,n),t=Math.min(a.h-u,t),h.width(m(d)).height(m(i)),e.width(m(d+w)),a=e.width(),n=e.height(),g.aspectRatio)for(;(a>o||n>p)&&(d>k&&i>l)&&!(19<c++);)i=Math.max(l,Math.min(t,i-10)),d=i*C,d<k&&(d=k,i=d/C),h.width(m(d)).height(m(i)),e.width(m(d+w)),a=e.width(),n=e.height();else d=Math.max(k,Math.min(d,d-
(a-o))),i=Math.max(l,Math.min(i,i-(n-p)));q&&("auto"===r&&i<z&&d+w+q<o)&&(d+=q);h.width(m(d)).height(m(i));e.width(m(d+w));a=e.width();n=e.height();e=(a>o||n>p)&&d>k&&i>l;d=g.aspectRatio?d<D&&i<y&&d<A&&i<z:(d<D||i<y)&&(d<A||i<z);f.extend(g,{dim:{width:v(a),height:v(n)},origWidth:A,origHeight:z,canShrink:e,canExpand:d,wPadding:w,hPadding:x,wrapSpace:n-j.outerHeight(!0),skinSpace:j.height()-i});!E&&(g.autoHeight&&i>l&&i<t&&!d)&&h.height("auto")},_getPosition:function(a){var c=b.current,e=b.getViewport(),
d=c.margin,f=b.wrap.width()+d[1]+d[3],h=b.wrap.height()+d[0]+d[2],g={position:"absolute",top:d[0]+e.y,left:d[3]+e.x};c.autoCenter&&(c.fixed&&!a&&h<=e.h&&f<=e.w)&&(g={position:"fixed",top:d[0],left:d[3]});g.top=v(Math.max(g.top,g.top+(e.h-h)*c.topRatio));g.left=v(Math.max(g.left,g.left+0.5*(e.w-f)));return g},_afterZoomIn:function(){var a=b.current;if(a&&(b.isOpen=b.isOpened=!0,b.wrap.addClass("fancybox-opened").css("overflow","visible"),b.reposition(),(a.closeClick||a.nextClick)&&b.inner.css("cursor",
"pointer").bind("click.fb",function(c){if(!f(c.target).is("a")&&!f(c.target).parent().is("a"))b[a.closeClick?"close":"next"]()}),a.closeBtn&&f(a.tpl.closeBtn).appendTo(b.skin).bind("click.fb",b.close),a.arrows&&1<b.group.length&&((a.loop||0<a.index)&&f(a.tpl.prev).appendTo(b.outer).bind("click.fb",b.prev),(a.loop||a.index<b.group.length-1)&&f(a.tpl.next).appendTo(b.outer).bind("click.fb",b.next)),b.trigger("afterShow"),b.opts.autoPlay&&!b.player.isActive))b.opts.autoPlay=!1,b.play()},_afterZoomOut:function(){var a=
b.current;b.wrap.trigger("onReset").remove();f.extend(b,{group:{},opts:{},router:!1,current:null,isActive:!1,isOpened:!1,isOpen:!1,isClosing:!1,wrap:null,skin:null,outer:null,inner:null});b.trigger("afterClose",a)}});b.transitions={getOrigPosition:function(){var a=b.current,c=a.element,e=f(a.orig),d={},j=50,h=50,g=a.hPadding,i=a.wPadding;!e.length&&(a.isDom&&c.is(":visible"))&&(e=c.find("img:first"),e.length||(e=c));e.length?(d=e.offset(),e.is("img")&&(j=e.outerWidth(),h=e.outerHeight())):(a=b.getViewport(),
d.top=a.y+0.5*(a.h-h),d.left=a.x+0.5*(a.w-j));return d={top:v(d.top-0.5*g),left:v(d.left-0.5*i),width:v(j+i),height:v(h+g)}},step:function(a,c){var e,d,f=c.prop;d=b.current;var h=d.wrapSpace,g=d.skinSpace;if("width"===f||"height"===f)e=c.end===c.start?1:(a-c.start)/(c.end-c.start),b.isClosing&&(e=1-e),d="width"===f?d.wPadding:d.hPadding,d=a-d,b.skin[f](m("width"===f?d:d-h*e)),b.inner[f](m("width"===f?d:d-h*e-g*e))},zoomIn:function(){var a=b.current,c=a.pos,e=a.openEffect,d="elastic"===e,j=f.extend({opacity:1},
c);delete j.position;d?(c=this.getOrigPosition(),a.openOpacity&&(c.opacity=0.1)):"fade"===e&&(c.opacity=0.1);b.wrap.css(c).animate(j,{duration:"none"===e?0:a.openSpeed,easing:a.openEasing,step:d?this.step:null,complete:b._afterZoomIn})},zoomOut:function(){var a=b.current,c=a.closeEffect,e="elastic"===c,d={opacity:0.1};e&&(d=this.getOrigPosition(),a.closeOpacity&&(d.opacity=0.1));b.wrap.animate(d,{duration:"none"===c?0:a.closeSpeed,easing:a.closeEasing,step:e?this.step:null,complete:b._afterZoomOut})},
changeIn:function(){var a=b.current,c=a.nextEffect,e=a.pos,d={opacity:1},f=b.direction,h;e.opacity=0.1;"elastic"===c&&(h="down"===f||"up"===f?"top":"left","down"===f||"right"===f?(e[h]=v(parseInt(e[h],10)-200),d[h]="+=200px"):(e[h]=v(parseInt(e[h],10)+200),d[h]="-=200px"));b.wrap.css(e).animate(d,{duration:"none"===c?0:a.nextSpeed,easing:a.nextEasing,complete:function(){setTimeout(b._afterZoomIn,10)}})},changeOut:function(){var a=b.previous,c=a.prevEffect,e={opacity:0.1},d=b.direction;"elastic"===
c&&(e["down"===d||"up"===d?"top":"left"]=("up"===d||"left"===d?"-":"+")+"=200px");a.wrap.animate(e,{duration:"none"===c?0:a.prevSpeed,easing:a.prevEasing,complete:function(){f(this).trigger("onReset").remove()}})}};b.helpers.overlay={overlay:null,update:function(){var a,b;this.overlay.width("100%").height("100%");f.browser.msie||r?(a=Math.max(x.documentElement.scrollWidth,x.body.scrollWidth),b=Math.max(x.documentElement.offsetWidth,x.body.offsetWidth),a=a<b?p.width():a):a=o.width();this.overlay.width(a).height(o.height())},
beforeShow:function(a){var c;this.overlay||(a=f.extend(!0,{},b.defaults.helpers.overlay,a),c=this.overlay=f('<div id="fancybox-overlay"></div>').css(a.css).appendTo("body").bind("mousewheel",function(a){(!b.wrap||"fixed"===b.wrap.css("position")||b.wrap.is(":animated"))&&a.preventDefault()}),a.closeClick&&c.bind("click.fb",b.close),b.opts.fixed&&!r?c.addClass("overlay-fixed"):(this.update(),this.onUpdate=function(){this.update()}),c.fadeTo(a.speedIn,a.opacity))},afterClose:function(a){this.overlay&&
this.overlay.fadeOut(a.speedOut||0,function(){f(this).remove()});this.overlay=null}};b.helpers.title={beforeShow:function(a){var c=b.current.title,a=a.type;c&&(c=f('<div class="fancybox-title fancybox-title-'+a+'-wrap">'+c+"</div>").appendTo("body"),"float"===a&&(c.width(c.width()).wrapInner('<span class="child"></span>'),b.current.margin[2]+=Math.abs(parseInt(c.css("margin-bottom"),10))),c.appendTo("over"===a?b.inner:"outside"===a?b.wrap:b.skin))}};f.fn.fancybox=function(a){var c,e=f(this),d=this.selector||
"",j=function(h){var g=this,i=c,j,l;!h.ctrlKey&&(!h.altKey&&!h.shiftKey&&!h.metaKey)&&!f(g).is(".fancybox-wrap")&&(j=a.groupAttr||"data-fancybox-group",l=f(g).attr(j),l||(j="rel",l=g[j]),l&&(""!==l&&"nofollow"!==l)&&(g=d.length?f(d):e,g=g.filter("["+j+'="'+l+'"]'),i=g.index(this)),a.index=i,!1!==b.open(g,a)&&h.preventDefault())},a=a||{};c=a.index||0;!d||!1===a.live?e.unbind("click.fb-start").bind("click.fb-start",j):o.undelegate(d,"click.fb-start").delegate(d+":not('.fancybox-item, .fancybox-nav')",
"click.fb-start",j);return this};f.scrollbarWidth||(f.scrollbarWidth=function(){var a,b;a=f('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body");b=a.children();b=b.innerWidth()-b.height(99).innerWidth();a.remove();return b});o.ready(function(){f.extend(b.defaults,{scrollOutside:f.scrollbarWidth(),fixed:f.support.fixedPosition||!(f.browser.msie&&f.browser.version<=6||r),parent:f("body")})})})(window,document,jQuery);