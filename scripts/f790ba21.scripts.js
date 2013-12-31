"use strict";angular.module("gameApp",["ngCookies","ngResource","ngSanitize","ngRoute","gameApp.services.db","gameApp.services.session","gameApp.services.notification","gameApp.services.game","gameApp.services.mainplayer","gameApp.services.robot"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/game",{templateUrl:"views/game.html",controller:"GameCtrl"}).when("/users",{templateUrl:"views/users.html",controller:"UsersCtrl"}).when("/about",{templateUrl:"views/about.html"}).otherwise({redirectTo:"/"})}]),Date.prototype.getWeek=function(){var a=new Date(this.getFullYear(),0,1);return Math.ceil(((this-a)/864e5+a.getDay()+1)/7)},angular.module("gameApp").controller("MainCtrl",["$rootScope","$scope","$location","$timeout","Db","Session","Notification","Game",function(a,b,c,d,e,f,g,h){function i(){a.isSignedIn=f.isSignedIn();var c=f.getUser();c&&(b.name=c.name)}function j(a){var c=$.map(b.chat_messages,function(b,c){return b.id==a?c:void 0});return c[0]}a.current_date=(new Date).getTime(),a.weekNumber=(new Date).getWeek(),b.chat_messages=[],g.enable(),console.log("main"),h.stop(),i(),f.onUsersLoad(i),e.onChatMsg(function(a){b.chat_messages.push(a),h.addMessage({text:a.name+": "+a.text,delay:10,type:"chat"}),a.date>(new Date).getTime()-5e3&&g.add(g.types.CHAT,a.name+": "+a.text)}),b.login=function(){f.login(b.name,b.pwd),a.isSignedIn=f.isSignedIn()},b.test=function(){console.log("ok")},b.signup=function(){f.signup(b,b.name,b.email,b.pwd),a.isSignedIn=f.isSignedIn()},a.logout=function(){f.logout(),a.isSignedIn=!1},b.addMsg=function(a,c){c&&(e.addMessage(a,c),b.msg="")},b.deleteMsg=function(a){var c=j(a);e.deleteMessage(a),b.chat_messages.splice(c,1)}}]),angular.module("gameApp").controller("GameCtrl",["$rootScope","$scope","$timeout","$location","Db","Game","Session","MainPlayer",function(a,b,c,d,e,f,g,h){function i(a){var b=null;return t.some(function(c){return c.id==a?(b=c,void 0):void 0}),b}function j(a,b){var c=i(a);if(c){c.move(b.pos,b.rot);var d=null!=b.connections;c.onlinePresence!=d&&f.addMessage({text:c.name+" is now "+(d?"online":"offline"),delay:10,type:d?"info":"error"}),c.updateOnlinePresence(d)}}function k(a){b.pos=a.pos}function l(){b.showInventory=!b.showInventory}function m(a,c){b.inventory=a,b.selectedInventoryObject=c}function n(a){a=a?1e3*a:4e3,c(function(){b.msgs.splice(0,1),0==b.msgs.length?b.showConsole=!1:n(b.msgs[0].delay)},a)}function o(a){b.msgs.push(a),b.showConsole=!0,1==b.msgs.length&&n(a.delay)}var p=g.getUser();if(!p)return d.path("/"),void 0;b.showInventory=!1,b.showConsole=!1,b.msgs=[];var q=null;c(function(){f.addMessage({text:"Welcome !",type:"system",delay:4})},4e3),c(function(){f.addMessage({text:"La position des autres joueurs n'est pas mise à jour en temps réel. C'est normal pour l'instant. Ce n'est pas du lag :)",type:"system",delay:7})},6e3),b.selectInventory=function(a){b.selectedInventoryObject==a.id?(b.selectedInventoryObject=null,q.setSelectedObject(null)):(b.selectedInventoryObject=a,q.setSelectedObject(a))};var r=f.init(o);if(r)console.log("Game was already initialized");else{q=h.newPlayer(p,{playerUpdateCallback:k,toggleInventoryCallback:l,updateInventoryCallback:m}),f.addMainPlayer(q);var s=a.users,t=[];for(var u in s)if(s[u].id!=p.id){var v=e.newPlayer(s[u],j),w=f.addPNJ(v);w.updateOnlinePresence(!1),t.push(w)}console.log(t.length+" pnjs")}$("#instructions").click(function(){enablePointerLock()})}]),angular.module("gameApp").controller("UsersCtrl",["$scope","Db",function(){}]),angular.module("gameApp").controller("HeaderCtrl",["$scope","$location",function(a,b){a.isActive=function(a){return a===b.path()}}]),angular.module("gameApp.services.db",[]).factory("Db",["$rootScope","$location","$timeout",function(a,b,c){function d(a){s=(new Date).getTime();var b=m.child(q.id);b.child("pos").update(a),b.update({date:Firebase.ServerValue.TIMESTAMP})}function e(a){t=(new Date).getTime();var b=m.child(q.id);b.child("rot").update(a),b.update({date:Firebase.ServerValue.TIMESTAMP})}function f(){if(!q)throw"connect called without any user";var a=new Firebase(l.firebaseUrl+"/users/"+q.id+"/connections"),b=new Firebase(l.firebaseUrl+"/users/"+q.id+"/date"),c=new Firebase(l.firebaseUrl+"/.info/connected");c.on("value",function(c){if(c.val()===!0){b.set(Firebase.ServerValue.TIMESTAMP);var d=a.push(!0);d.onDisconnect().remove(),b.onDisconnect().set(Firebase.ServerValue.TIMESTAMP)}})}function g(b){m.once("value",function(c){null!==c.val()&&safeApply(a,function(){b(c.val())})})}function h(b){m.on("child_added",function(c){null!==c.val()&&safeApply(a,function(){b(c.val())})})}function i(a){if(!q)throw"no user!";var b=m.child(q.id).child("inventory").push().name(),c={id:b,type:a.type,display:Objects[a.type].display,path:Objects[a.type].path,date:Firebase.ServerValue.TIMESTAMP};return m.child(q.id).child("inventory").child(b).update(c),a.attrs&&(m.child(q.id).child("inventory").child(b).child("attrs").update(a.attrs),c.attrs=a.attrs),c}function j(a,b,c,d,e,f,g){return d||(d={x:0,y:50,z:0}),e||(e={corps:0,tete:100}),f=f?toArray(f):[],g=g?toArray(g):[],{id:a,name:b,email:c,pos:d,rot:e,inventory:f,robots:g}}function k(b,c,d){safeApply(a,function(){d(b,c.val())})}var l={firebaseUrl:"https://voxelgame.firebaseio.com"},m=new Firebase(l.firebaseUrl+"/users"),n=new Firebase(l.firebaseUrl+"/tchat"),o=new Firebase(l.firebaseUrl+"/cubes"),p=new Firebase(l.firebaseUrl+"/cubelist"),q=null,r=(new Date).getTime(),s=r,t=r,u=1e3,v=null,w=null;a.users=[];var x=new Firebase(l.firebaseUrl+"/.info/serverTimeOffset");return x.on("value",function(a){console.log(a.val()/1e3+"s clock offset")}),h(function(b){a.users.push(b)}),{getUsers:g,getUser:function(){return q},setUser:function(a){q=a,f()},addUser:function(a,b,c){var d=m.push().name(),e={id:d,name:a,email:b,date:Firebase.ServerValue.TIMESTAMP};m.child(d).set(e),c&&c(e)},newUser:j,newPlayer:function(b,c){var d=new Firebase(l.firebaseUrl+"/users/"+b.id);return d.on("value",function(d){safeApply(a,function(){c(b.id,d.val())})}),b},addMessage:function(a,b){var c=n.push().name();n.child(c).set({id:c,name:a,text:b,date:Firebase.ServerValue.TIMESTAMP})},deleteMessage:function(a){n.child(a).remove()},onChatMsg:function(b){n.off("child_added"),n.limit(10).on("child_added",function(c){safeApply(a,function(){b(c.val())})})},onCube:function(a){p.on("child_added",function(b){k("added",b,a)}),p.on("child_changed",function(b){k("changed",b,a)}),p.on("child_removed",function(b){k("removed",b,a)})},put:function(a,b,c,d,e){q&&o.child("pos").child(a).child(b).child(c).once("value",function(f){if(f.val())throw"There is a cube in Db here";var g=p.push().name(),h=(new Date).getTime();o.child("pos").child(a).child(b).child(c).update({id:g,type:d,display:Objects[d].display,path:Objects[d].path,user:q.id,date:h});var i={id:g,type:d,display:Objects[d].display,path:Objects[d].path,user:q.id,date:h,x:a,y:b,z:c};p.child(g).update(i),e&&e(i)})},addInventory:i,removeInventory:function(a){q&&m.child(q.id).child("inventory").child(a).remove()},remove:function(a){q&&p.child(a).once("value",function(b){var c=b.val();if(!c)throw"no cube in Db here";o.child("pos").child(c.x).child(c.y).child(c.z).remove(),p.child(a).remove()})},updatePos:function(a){if(q){var b=(new Date).getTime();if(s>b-u)return c.cancel(v),v=c(function(){d(a)},u-(b-s)),void 0;c.cancel(v),d(a),s=b}},updateRot:function(a){if(q){var b=(new Date).getTime();if(t>b-u)return c.cancel(w),w=c(function(){e(a)},u-(b-t)),void 0;c.cancel(w),e(a),t=b}},addRobot:function(a){if(q){var b=m.child(q.id).child("robots").push().name(),c={id:b,type:a.type,date:Firebase.ServerValue.TIMESTAMP};return m.child(q.id).child("robots").child(b).update(c),a.attrs&&(m.child(q.id).child("robots").child(b).child("attrs").update(a.attrs),c.attrs=a.attrs),c}}}}]),angular.module("gameApp.services.session",[]).factory("Session",["$rootScope","Db",function(a,b){function c(a){var b=null;return e.some(function(c){return c.name==a?(b=c,void 0):void 0}),b}var d=null,e=[],f=null;return b.getUsers(function(a){for(var c in a)e.push(b.newUser(c,a[c].name,a[c].email,a[c].pos,a[c].rot,a[c].inventory,a[c].robots));f&&f(),console.log("Session: "+e.length+" users")}),{onUsersLoad:function(a){f=a,e.length>0&&f&&f()},getUser:function(){return d},isSignedIn:function(){return d?(b.setUser(d),!0):(d=c(readCookie("voxelgame_name")),d&&b.setUser(d),null!=d)},changeLogin:function(a){d=c(a)},login:function(a){d=c(a),d&&(writeCookie("voxelgame_name",d.name,20),b.setUser(d))},signup:function(a,d,f){if(a.error="",0==e.length)return console.log("no users yet"),a.error="waiting for users to load, try again in 2 seconds",void 0;if(!d)return console.log("name is empty"),a.error="name can not be empty",void 0;var g=c(d);return g?(a.error="User already exists",void 0):(g?(a.error="pseudo "+d+" is already taken",a.name=""):(f||(f=""),b.addUser(d,f,function(a){e.push(a)}),a.pwd="enregistré!",writeCookie("voxelgame_name",d,20),a.error=""),void 0)},logout:function(){d=null,writeCookie("voxelgame_name","",20)}}}]),angular.module("gameApp.services.game",[]).factory("Game",["$rootScope","$location","Db","Session",function(a,b,c){function d(a){var b,c,d=a.lensFlares.length,e=2*-a.positionScreen.x,f=2*-a.positionScreen.y;for(b=0;d>b;b++)c=a.lensFlares[b],c.x=a.positionScreen.x+e*c.distance,c.y=a.positionScreen.y+f*c.distance,c.rotation=0;a.lensFlares[2].y+=.025,a.lensFlares[3].rotation=.5*a.positionScreen.x+THREE.Math.degToRad(45)}function e(a,b,c,e,f,g){var h=new THREE.DirectionalLight(16777215,1.5);h.color.setHSL(a,b,c),h.position.set(e,f,g),h.castShadow=!0,h.shadowDarkness=.8,y.add(h),h=new THREE.PointLight(16777215,1,0),h.color.setHSL(a,b,c),h.position.set(e,f,g);var i=new THREE.Color(16777215);i.setHSL(a,b,c+.5);var j=new THREE.LensFlare(L,700,0,THREE.AdditiveBlending,i);j.add(M,512,0,THREE.AdditiveBlending),j.add(M,512,0,THREE.AdditiveBlending),j.add(M,512,0,THREE.AdditiveBlending),j.add(N,60,.6,THREE.AdditiveBlending),j.add(N,70,.7,THREE.AdditiveBlending),j.add(N,120,.9,THREE.AdditiveBlending),j.add(N,70,1,THREE.AdditiveBlending),j.customUpdateCallback=d,j.position=h.position,y.add(j)}function f(){return J.map(function(a){return a.mesh})}function g(){y=new THREE.Scene,y.fog=new THREE.Fog(3355443,300,1e3),C=new THREE.AmbientLight(16777215),C.color.setHSL(.1,.3,.2),y.add(C),e(.995,.5,.9,0,500,300),Config.modeDebug&&s(),H=new THREEx.RendererStats,H.domElement.style.position="absolute",H.domElement.style.right="0px",H.domElement.style.top="50px",z=new THREE.WebGLRenderer({antialias:!0,alpha:!0}),z.setClearColor(3355443),z.shadowMapEnabled=!0,z.shadowMapSoft=!0,window.addEventListener("resize",o,!1),p(),c.onCube(n),F=!0}function h(a){var b=F;return K=a,G=!1,F||g(),x=$("#game"),o(),x.append(H.domElement),x.append(z.domElement),q(),b}function i(b){K&&safeApply(a,function(){K(b)})}function j(a){for(var b in J)if(J[b].obj&&J[b].obj.id==a.id)return b;return null}function k(a){if(j(a))throw"There is a cube there. Check it before you call addCubeToScene.";var b=new THREE.Mesh(A,Objects[a.type].material);Objects[a.type].opacity&&(b.material.transparent=!0,b.material.opacity=Objects[a.type].opacity),b.position.x=a.x*Config.dimCadri,b.position.y=a.y*Config.dimCadri,b.position.z=a.z*Config.dimCadri,Config.randomCubeRotation&&randomizeRot(b,Config.randomCubeRotationFactor),b.castShadow=!0,b.receiveShadow=!0,y.add(b),J.push({obj:a,mesh:b})}function l(a){y.remove(J[a].mesh),J.splice(a,1)}function m(a){var b=j(a);b?l(b):(console.error("did not find cube"),console.error(a))}function n(a,b){b.date>(new Date).getTime()-1e4&&console.log("cube "+a+" on "+b.x+", "+b.y+", "+b.z),"added"==a?k(b):"removed"==a?m(b):console.error("unknown onCube type "+a)}function o(){B&&(B.camera.aspect=window.innerWidth/window.innerHeight,B.camera.updateProjectionMatrix());var a=window.innerWidth-2*x[0].offsetLeft,b=window.innerHeight-x[0].offsetTop-5;x[0].style.width=a,x[0].style.height=b,z.setSize(a,b)}function p(){function a(a){if(!isLocked){var b=a.movementX||a.mozMovementX||a.webkitMovementX||0,d=a.movementY||a.mozMovementY||a.webkitMovementY||0;B.rotate(b,d),c.updateRot({corps:B.corps.rotation.y,tete:B.tete.rotation.x})}}var b=function(a){if(!isLocked)switch(a.keyCode){case 90:B.moveForward=!0;break;case 81:B.moveLeft=!0;break;case 83:B.moveBackward=!0;break;case 68:B.moveRight=!0;break;case 32:B.jump(!0);break;case 65:B.getCube();break;case 69:B.putCube();break;case 73:B.toggleInventory()}},d=function(a){switch(a.keyCode){case 38:case 90:B.moveForward=!1;break;case 37:case 81:B.moveLeft=!1;break;case 40:case 83:B.moveBackward=!1;break;case 39:case 68:B.moveRight=!1}};document.addEventListener("mousemove",a,!1),document.addEventListener("keydown",b,!1),document.addEventListener("keyup",d,!1),document.addEventListener("mousewheel",function(a){return isLocked?void 0:(B.camdist(a.wheelDelta),!1)},!1),document.addEventListener("mousedown",v,!1),document.addEventListener("mouseup",w,!1)}function q(){G||requestAnimationFrame(q),D=(new Date).getTime(),E=1e3/(D-O),O=D,Config.speedFactor=60/E,H.update(z),B&&(B.updateRobots(),isLocked||(B.move(),B.jump()),z.render(y,B.camera),B.corps.position.y<-150&&r())}function r(){i({text:"You're dead...",delay:5,type:"info"}),B.corps.position.x=0,B.corps.position.y=Config.dimCadri+10,B.corps.position.z=0}function s(){I[0]=new u,y.add(I[0].mesh),I[1]=new u,y.add(I[1].mesh),I[2]=new u,y.add(I[2].mesh)}function t(a){this.id=a.id,this.name=a.name,this.onlinePresence=!1,this.corps=new THREE.Object3D,copyVector(this.corps.position,a.pos);var b=[new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body1.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body2.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body3.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body4.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body5.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body6.jpg")})],c=Config.dimCadri,d=new THREE.CubeGeometry(c,c,c/2);this.torse=new THREE.Mesh(d,new THREE.MeshFaceMaterial(b)),this.corps.add(this.torse),this.torse.castShadow=!0,this.torse.receiveShadow=!0;var b=[new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body1.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body2.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/head3.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body4.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/head5.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/head6.jpg")})],e=new THREE.CubeGeometry(c/2,c/2,c/2);this.tete=new THREE.Mesh(e,new THREE.MeshFaceMaterial(b)),this.tete.castShadow=!0,this.tete.receiveShadow=!0,this.tete.position.y=c,this.tete.position.z=-c/4,this.corps.add(this.tete);var f=new THREE.TextGeometry(a.name,{font:"optimer",weight:"normal",style:"normal",size:4,height:.5,curveSegments:2,bevelThickness:.1,bevelSize:.1,bevelEnabled:!0}),g=new THREE.MeshPhongMaterial({color:16755200,transparent:!0});this.name_label=new THREE.Mesh(f,g);var h=new THREE.Box3;h.setFromObject(this.name_label);var i=(h.max.x-h.min.x)/2;return this.name_label.position.y=.25*c,this.name_label.position.z=.5*c,this.name_label.position.x=-i,this.corps.add(this.name_label),copyRotation(this,a.rot),y.add(this.corps),J.push({mesh:this.torse}),this.updateOnlinePresence=function(a){this.onlinePresence=a,a?(this.torse.material.opacity=1,this.tete.castShadow=!0,this.tete.receiveShadow=!0,this.torse.castShadow=!0,this.torse.receiveShadow=!0):(this.torse.material.opacity=.4,this.name_label.material.opacity=.4,this.tete.castShadow=!1,this.tete.receiveShadow=!1,this.torse.castShadow=!1,this.torse.receiveShadow=!1)},this.move=function(a,b){copyVector(this.corps.position,a),copyRotation(this,b)},this}function u(){this.mesh=new THREE.BoxHelper,this.mesh.scale.set(Config.dimCadri/2,Config.dimCadri/2,Config.dimCadri/2),this.mesh.visible=!1}function v(a){if(!isLocked){switch(a.button){case 0:B.dummy.mesh.material.color.setRGB(1,0,0);break;case 1:break;case 2:B.dummy.mesh.material.color.setRGB(0,1,0)}B.dummy.mesh.visible=!0}}function w(a){if(!isLocked)switch(B.dummy.mesh.visible=!1,a.button){case 0:B.getCube();break;case 1:break;case 2:B.putCube()}}var x,y,z,A,B,C,D,E,F=!1,G=!0,H=null,I=[],A=new THREE.CubeGeometry(Config.dimCadri,Config.dimCadri,Config.dimCadri),J=[],K=null,L=THREE.ImageUtils.loadTexture("images/lensflare0.png"),M=THREE.ImageUtils.loadTexture("images/lensflare2.png"),N=THREE.ImageUtils.loadTexture("images/lensflare3.png"),O=(new Date).getTime();return{init:function(a){return h(a)},stop:function(){G||console.log("Game rendering has been stopped but still receive DB updates"),G=!0},addMainPlayer:function(a){B=a,y.add(B.corps),B.robots.forEach(function(a){y.add(a.body)})},addRobot:function(a){y.add(a.corps)},addPNJ:function(a){return new t(a)},getObjects:function(){return J},getMeshObjects:function(){return f()},addCubeToScene:function(a){k(a)},removeCubeFromScene:function(a){m(a)},removeCubeFromSceneByKey:function(a){l(a)},addGetPutDummy:function(){var a=new u;return y.add(a.mesh),a},addMessage:function(a){i(a)}}}]),angular.module("gameApp.services.mainplayer",[]).factory("MainPlayer",["$rootScope","$location","Db","Session","Game","Robot",function(a,b,c,d,e,f){function g(b,d){function g(a){var b=null;return l.inventory.some(function(c){return c.id==a?(b=c,void 0):void 0}),b}function h(a){var b=l.inventory;for(var c in b)if(b[c].id==a)return c;return null}function i(){l.inventory&&l.inventory.sort(function(a,b){return a.display<b.display?-1:1})}function j(a){var b=e.getMeshObjects();for(var c in b)if(b[c].position.x==a.x&&b[c].position.y==a.y&&b[c].position.z==a.z)return c;return null}function k(a){if(0==l.inventory.length)m=null;else{for(a||(a=0);a>=l.inventory.length;)a--;m=l.inventory[a],d.updateInventoryCallback(l.inventory,m)}}var l=b,m=null;i(),k(0);var n=(l.id,new THREE.Vector3(l.pos.x,l.pos.y,l.pos.z));this.dummy=e.addGetPutDummy();var o=Config.distCamPlayer,p=.66*Config.dimCadri,q=document.createElement("audio"),r=document.createElement("source");r.src="sounds/ammo_bounce.wav",q.appendChild(r),q.play(),this.name=name;var s=!0,t=0;this.jumping=!1,this.corps=new THREE.Object3D,this.corps.position.copy(l.pos);var u=[new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body1.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body2.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body3.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body4.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body5.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body6.jpg")})],v=Config.dimCadri,w=new THREE.CubeGeometry(v,v,v/2);this.torse=new THREE.Mesh(w,new THREE.MeshFaceMaterial(u)),this.torse.castShadow=!0,this.torse.receiveShadow=!0,this.corps.add(this.torse);var u=[new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body1.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body2.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body3.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body4.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/head5.jpg")}),new THREE.MeshLambertMaterial({ambient:16777215,map:THREE.ImageUtils.loadTexture("images/body6.jpg")})],x=new THREE.CubeGeometry(v/2,v/2,v/2);this.tete=new THREE.Mesh(x,new THREE.MeshFaceMaterial(u)),this.tete.castShadow=!0,this.tete.receiveShadow=!0,this.tete.position.y=v,this.tete.position.z=-v/4,this.corps.add(this.tete),this.camera=new THREE.PerspectiveCamera(Config.viewwAngle,window.innerWidth/window.innerHeight,1,1e3),this.camera.position.x+=Math.sin(this.corps.rotation.y)*o,this.camera.position.z+=Math.cos(this.corps.rotation.y)*o,this.tete.add(this.camera),this.corps.rotation.y=l.rot.corps,this.tete.rotation.x=l.rot.tete,this.robots=[];for(var y=0;y<l.robots.length;y++)this.robots.push(new f.newRobot(l.robots[y],this,{}));this.updateRobots=function(){this.robots.forEach(function(a){a.update()})},this.updateCamera=function(){this.camera.position.x+=(this.tete.position.x-this.camera.position.x)/10,this.camera.position.y+=(this.tete.position.y-this.camera.position.y-Config.dimCadri/2)/10},this.rotate=function(a,b){this.corps.rotation.y-=.002*a,this.tete.rotation.x-=.002*b,this.tete.rotation.x>Math.PI/2&&(this.tete.rotation.x=Math.PI/2),this.tete.rotation.x<-Math.PI/2&&(this.tete.rotation.x=-Math.PI/2)},this.move=function(){var a=this.canMove();if(a&&(0!=a.x||0!=a.z)){n.copy(this.corps.position),n.x+=a.x*Config.playerSpeed*Config.speedFactor,n.z+=a.z*Config.playerSpeed*Config.speedFactor,this.corps.position.copy(n);var b={x:n.x,y:n.y,z:n.z};if(c.updatePos(b),Config.randomCubeRotation&&!this.jumping){var d={rotation:{x:0,y:0,z:0}};randomizeRot(d,.02),copyVector(this.torse.rotation,d.rotation)}}},this.canMove=function(){var a=[],b=[],c=Math.PI/4;a[0]=0,b[0]=0,a[1]=0,b[1]=0,a[2]=0,b[2]=0,this.moveForward&&(a[0]-=Math.sin(this.corps.rotation.y-c),b[0]-=Math.cos(this.corps.rotation.y-c),a[1]-=Math.sin(this.corps.rotation.y),b[1]-=Math.cos(this.corps.rotation.y),a[2]-=Math.sin(this.corps.rotation.y+c),b[2]-=Math.cos(this.corps.rotation.y+c)),this.moveBackward&&(a[0]+=Math.sin(this.corps.rotation.y-c),b[0]+=Math.cos(this.corps.rotation.y-c),a[1]+=Math.sin(this.corps.rotation.y),b[1]+=Math.cos(this.corps.rotation.y),a[2]+=Math.sin(this.corps.rotation.y+c),b[2]+=Math.cos(this.corps.rotation.y+c)),this.moveLeft&&(a[0]-=Math.sin(this.corps.rotation.y+Math.PI/2-c),b[0]-=Math.cos(this.corps.rotation.y+Math.PI/2-c),a[1]-=Math.sin(this.corps.rotation.y+Math.PI/2),b[1]-=Math.cos(this.corps.rotation.y+Math.PI/2),a[2]-=Math.sin(this.corps.rotation.y+Math.PI/2+c),b[2]-=Math.cos(this.corps.rotation.y+Math.PI/2+c)),this.moveRight&&(a[0]-=Math.sin(this.corps.rotation.y-Math.PI/2-c),b[0]-=Math.cos(this.corps.rotation.y-Math.PI/2-c),a[1]-=Math.sin(this.corps.rotation.y-Math.PI/2),b[1]-=Math.cos(this.corps.rotation.y-Math.PI/2),a[2]-=Math.sin(this.corps.rotation.y-Math.PI/2+c),b[2]-=Math.cos(this.corps.rotation.y-Math.PI/2+c));for(var d={x:a[1],z:b[1]},f=e.getMeshObjects(),g=0;3>g;g++){var h=new THREE.Raycaster(this.corps.position,new THREE.Vector3(a[g]*p,0,b[g]*p).normalize()),i=h.intersectObjects(f);i.length>0&&i[0].distance<p&&(q.play(),d=!1)}var j=Config.dimCadri+5;return this.dummy.mesh.position.y=Math.round((this.corps.position.y+Math.sin(this.tete.rotation.x)*j+Config.dimCadri/2)/Config.dimCadri)*Config.dimCadri,this.dummy.mesh.position.x=Math.round((this.corps.position.x-Math.sin(this.corps.rotation.y)*j*Math.cos(this.tete.rotation.x))/Config.dimCadri)*Config.dimCadri,this.dummy.mesh.position.z=Math.round((this.corps.position.z-Math.cos(this.corps.rotation.y)*j*Math.cos(this.tete.rotation.x))/Config.dimCadri)*Config.dimCadri,d},this.jump=function(a){a&&(this.jumping=!0),s&&1==this.jumping&&(s=!1,t=4.3);var b=!0,c=new THREE.Raycaster(this.corps.position,new THREE.Vector3(0,-1,0)),d=c.intersectObjects(e.getMeshObjects());d.length>0&&d[0].distance<p&&(b=!1),0>t&&(this.jumping=!1),b||1==this.jumping?(t>-5&&(t-=.2*Config.speedFactor),this.corps.position.y+=t):(0>t&&(t=0),s=!0,this.jumping=!1)},this.toggleInventory=function(){d.toggleInventoryCallback&&d.updateInventoryCallback&&safeApply(a,function(){d.updateInventoryCallback(l.inventory,m),d.toggleInventoryCallback()})},this.getCube=function(){if(l.inventory.length>=Config.maxInventory)return e.addMessage({text:"Too many objects in inventory",delay:5,type:"error"}),void 0;var a=this.canGet();if(a){var b=e.getObjects()[a].obj;c.remove(b.id);var b=c.addInventory({type:b.type});l.inventory.push(b),i(),m=b,d.updateInventoryCallback(l.inventory,b),e.addMessage({text:"ok, in inventory",delay:3,type:"info"})}else e.addMessage({text:"No cube here !",delay:3,type:"error"})},this.canGet=function(){return j(this.dummy.mesh.position)},this.putCube=function(){var a=this.canGet();if(a)return e.addMessage({text:"There is a cube there",delay:2,type:"error"}),void 0;if(!m)return e.addMessage({text:"Nothing in hand!",delay:2,type:"error"}),void 0;var b={x:this.dummy.mesh.position.x/Config.dimCadri,y:this.dummy.mesh.position.y/Config.dimCadri,z:this.dummy.mesh.position.z/Config.dimCadri};c.put(b.x,b.y,b.z,m.type),c.removeInventory(m.id);var f=h(m.id);l.inventory.splice(f,1),d.updateInventoryCallback(l.inventory),k(f)},this.setCamDist=function(a){var b=5,c=a;b>c&&(c=b),this.camera.position.x=this.tete.position.x+Math.sin(this.tete.rotation.y)*c,this.camera.position.z=this.tete.position.z+Math.cos(this.tete.rotation.y)*c,b>a?(this.camera.fov=Config.viewAngle-a/1.5,this.camera.updateProjectionMatrix()):this.camera.fov!=Config.viewAngle&&(this.camera.fov=Config.viewAngle,this.camera.updateProjectionMatrix())},this.camdist=function(a){o-=a/10,-60>o&&(o=-60),this.setCamDist(o)},this.setCamDist(Config.distCamPlayer),this.setSelectedObject=function(a){m=g(a.id)}}return{newPlayer:function(a,b){return g=new g(a,b)}}}]),angular.module("gameApp.services.robot",[]).factory("Robot",["$rootScope","$location","Db","Game",function(){function a(a,b){a.pos||(a.pos={x:b.corps.position.x,y:b.corps.position.y,z:b.corps.position.z}),a.rot||(a.rot={body:b.corps.rotation.y}),console.log(a),this.body=new THREE.Object3D,this.body.position.copy(a.pos);var c=THREE.ImageUtils.loadTexture("images/ash_uvgrid01.jpg");c.wrapS=c.wrapT=THREE.RepeatWrapping,c.anisotropy=16;var d=new THREE.MeshLambertMaterial({ambient:16777215,map:c}),e=Config.dimCadri/2,f=new THREE.CubeGeometry(e,e,e);this.torso=new THREE.Mesh(f,d),this.torso.castShadow=!0,this.torso.receiveShadow=!0,this.body.add(this.torso),this.update=function(){this.moveTowardsPlayer()},this.goTo=function(a,b){var c=a.x-this.body.position.x;Math.abs(c)<b&&(0>c?c+=50:c-=50),this.body.position.x+=c/50,c=a.y-this.body.position.y,this.body.position.y+=c/50,c=a.z-this.body.position.z,Math.abs(c)<b&&(0>c?c+=50:c-=50),this.body.position.z+=c/50},this.moveTowardsPlayer=function(){this.goTo(b.corps.position,2*Config.dimCadri)},this.explore=function(){var a=c.getNextUnchartedCase();goTo(a.position,0)}}return{newRobot:function(b,c,d){return new a(b,c,d)}}}]),angular.module("gameApp.services.notification",[]).factory("Notification",["$rootScope",function(){return{types:{CHAT:{title:"Jethro koull",icon:"http://www.cusi.fr/site/tchat-enfant/im/msn.jpg"}},enable:function(){"undefined"!=typeof webkitNotifications&&0!=webkitNotifications.checkPermission()&&(console.log("no notification permissions"),webkitNotifications.requestPermission())},add:function(a,b){if("undefined"!=typeof webkitNotifications)try{webkitNotifications.createNotification(a.icon,a.title,b).show()}catch(c){console.log(c.message)}}}}]);