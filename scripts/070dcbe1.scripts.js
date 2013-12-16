"use strict";angular.module("gameApp",["ngCookies","ngResource","ngSanitize","gameApp.services.db","gameApp.services.session","gameApp.services.notification","gameApp.services.game","gameApp.services.mainplayer"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/game",{templateUrl:"views/game.html",controller:"GameCtrl"}).when("/users",{templateUrl:"views/users.html",controller:"UsersCtrl"}).when("/about",{templateUrl:"views/about.html"}).otherwise({redirectTo:"/"})}]),Date.prototype.getWeek=function(){var a=new Date(this.getFullYear(),0,1);return Math.ceil(((this-a)/864e5+a.getDay()+1)/7)},angular.module("gameApp").controller("MainCtrl",["$rootScope","$scope","$location","$timeout","Db","Session","Notification",function(a,b,c,d,e,f,g){function h(){a.isSignedIn=f.isSignedIn();var c=f.getUser();c&&(b.name=c.name)}function i(a){var c=$.map(b.chat_messages,function(b,c){return b.id==a?c:void 0});return c[0]}a.current_date=(new Date).getTime(),a.weekNumber=(new Date).getWeek(),b.chat_messages=[],g.enable(),console.log("main"),h(),f.onUsersLoad(h),e.onChatMsg(function(a){b.chat_messages.push(a),a.date>(new Date).getTime()-1e4&&g.add(g.types.CHAT,a.name+": "+a.text)}),b.login=function(){f.login(b.name,b.pwd),a.isSignedIn=f.isSignedIn()},b.test=function(){console.log("ok")},b.signup=function(){f.signup(b,b.name,b.email,b.pwd),a.isSignedIn=f.isSignedIn()},a.logout=function(){f.logout(),a.isSignedIn=!1},b.addMsg=function(a,c){c&&(e.addMessage(a,c),b.msg="")},b.deleteMsg=function(a){var c=i(a);e.deleteMessage(a),b.chat_messages.splice(c,1)}}]),angular.module("gameApp").controller("GameCtrl",["$rootScope","$scope","$timeout","$location","Db","Game","Session","MainPlayer",function(a,b,c,d,e,f,g,h){function i(a){var b=null;return r.some(function(c){return c.id==a?(b=c,void 0):void 0}),b}function j(a,b){var c=i(a);c&&c.move(b.pos,b.rot)}function k(a){b.pos=a.pos}function l(a){a&&(b.inventory=a),b.showInventory=!b.showInventory}function m(){c(function(){b.msgs.splice(0,1),0==b.msgs.length?b.showConsole=!1:m()},4e3)}function n(a){b.msgs.push(a),b.showConsole=!0,m()}var o=g.getUser();if(!o)return d.path("/"),void 0;b.showInventory=!1,b.showConsole=!1,b.msgs=[],b.selectInventory=function(a){b.selectedInventoryObject=b.selectedInventoryObject==a.id?null:a.id},f.init(n);var p=h.newPlayer(o.id,o.name,o.pos,k,l);f.addMainPlayer(p);var q=a.users,r=[];for(var s in q)if(q[s].id!=o.id){var p=e.newPlayer(q[s].id,q[s].name,q[s].pos,q[s].rot,j);r.push(f.addPNJ(p.id,p.name,p.pos,p.rot))}console.log(r.length+" pnjs"),f.animate(),$("#instructions").click(function(){enablePointerLock()})}]),angular.module("gameApp").controller("UsersCtrl",["$scope","Db",function(){}]),angular.module("gameApp").controller("HeaderCtrl",["$scope","$location",function(a,b){a.isActive=function(a){return a===b.path()}}]),angular.module("gameApp.services.db",[]).factory("Db",["$rootScope","$location",function(a){function b(a,b){a.$$phase||a.$root.$$phase?b():a.$apply(b)}function c(){if(!m)throw"connect called without any user";var a=new Firebase(h.firebaseUrl+"/users/"+m.id+"/connections"),b=new Firebase(h.firebaseUrl+"/users/"+m.id+"/date"),c=new Firebase(h.firebaseUrl+"/.info/connected");c.on("value",function(c){if(c.val()===!0){b.set(Firebase.ServerValue.TIMESTAMP);var d=a.push(!0);d.onDisconnect().remove(),b.onDisconnect().set(Firebase.ServerValue.TIMESTAMP)}})}function d(c){i.once("value",function(d){null!==d.val()&&b(a,function(){c(d.val())})})}function e(c){i.on("child_added",function(d){null!==d.val()&&b(a,function(){c(d.val())})})}function f(a,b,c,d,e,f){return{id:a,name:b,email:c,pos:d,rot:e,inventory:f}}function g(c,d,e){b(a,function(){e(c,d.val())})}var h={firebaseUrl:"https://voxelgame.firebaseio.com"},i=new Firebase(h.firebaseUrl+"/users"),j=new Firebase(h.firebaseUrl+"/tchat"),k=new Firebase(h.firebaseUrl+"/cubes"),l=new Firebase(h.firebaseUrl+"/cubelist"),m=null,n=(new Date).getTime(),o=(new Date).getTime(),p=1e3;return a.users=[],e(function(b){a.users.push(b)}),{getUsers:d,getUser:function(){return m},setUser:function(a){m=a,c()},addUser:function(a,b,c){var d=i.push().name(),e={id:d,name:a,email:b,date:Firebase.ServerValue.TIMESTAMP};i.child(d).set(e),c&&c(e)},newUser:f,newPlayer:function(c,d,e,f,g){var i=new Firebase(h.firebaseUrl+"/users/"+c);return i.on("value",function(d){b(a,function(){g(c,d.val())})}),{id:c,name:d,pos:e,rot:f}},addMessage:function(a,b){var c=j.push().name();j.child(c).set({id:c,name:a,text:b,date:Firebase.ServerValue.TIMESTAMP})},deleteMessage:function(a){j.child(a).remove()},onChatMsg:function(c){j.off("child_added"),j.limit(10).on("child_added",function(d){b(a,function(){c(d.val())})})},onCube:function(a){l.on("child_added",function(b){g("added",b,a)}),l.on("child_changed",function(b){g("changed",b,a)}),l.on("child_removed",function(b){g("removed",b,a)})},put:function(a,b,c,d,e){m&&k.child("pos").child(a).child(b).child(c).once("value",function(f){if(f.val())throw"There is a cube in Db here";var g=l.push().name(),h=(new Date).getTime();k.child("pos").child(a).child(b).child(c).update({id:g,type:d,user:m.id,date:h});var i={id:g,type:d,user:m.id,date:h,x:a,y:b,z:c};l.child(g).update(i),e&&e(i)})},addInventory:function(a){if(m){var b=i.child(m.id).child("inventory").push().name(),c={id:b,type:a.type,date:Firebase.ServerValue.TIMESTAMP};return i.child(m.id).child("inventory").child(b).update(c),a.attrs&&(i.child(m.id).child("inventory").child(b).child("attrs").update(a.attrs),c.attrs=a.attrs),c}},removeInventory:function(a){m&&i.child(m.id).child("inventory").child(a).remove()},remove:function(a){m&&l.child(a).once("value",function(b){var c=b.val();if(!c)throw"no cube in Db here";k.child("pos").child(c.x).child(c.y).child(c.z).remove(),l.child(a).remove()})},updatePos:function(a){if(m){var b=(new Date).getTime();if(!(n>b-p)){n=b;var c=i.child(m.id);c.child("pos").update(a),c.update({date:b})}}},updateRot:function(a){if(m){var b=(new Date).getTime();if(!(o>b-p)){o=b;var c=i.child(m.id);c.child("rot").update(a),c.update({date:(new Date).getTime()})}}}}}]),angular.module("gameApp.services.session",[]).factory("Session",["$rootScope","Db",function(a,b){function c(a){var b=null;return e.some(function(c){return c.name==a?(b=c,void 0):void 0}),b}var d=null,e=[],f=null;return b.getUsers(function(a){for(var c in a)e.push(b.newUser(c,a[c].name,a[c].email,a[c].pos,a[c].rot,a[c].inventory));f&&f(),console.log("Session: "+e.length+" users")}),{onUsersLoad:function(a){f=a,e.length>0&&f&&f()},getUser:function(){return d},isSignedIn:function(){return d?(b.setUser(d),!0):(d=c(readCookie("voxelgame_name")),d&&b.setUser(d),null!=d)},changeLogin:function(a){d=c(a)},login:function(a){d=c(a),d&&(writeCookie("voxelgame_name",d.name,20),b.setUser(d))},signup:function(a,d,f){if(a.error="",0==e.length)return console.log("no users yet"),a.error="waiting for users to load, try again in 2 seconds",void 0;if(!d)return console.log("name is empty"),a.error="name can not be empty",void 0;var g=c(d);return g?(a.error="User already exists",void 0):(g?(a.error="pseudo "+d+" is already taken",a.name=""):(f||(f=""),b.addUser(d,f,function(a){e.push(a)}),a.pwd="enregistré!",writeCookie("voxelgame_name",d,20),a.error=""),void 0)},logout:function(){d=null,writeCookie("voxelgame_name","",20)}}}]),angular.module("gameApp.services.game",[]).factory("Game",["$rootScope","$location","Db","Session",function(a,b,c){function d(a,b){a.$$phase||a.$root.$$phase?b():a.$apply(b)}function e(a,b){a.x=b.x,a.y=b.y,a.z=b.z}function f(a,b){a.corps.rotation.y=b.corps,a.tete.rotation.x=b.tete}function g(a){var b,c,d=a.lensFlares.length,e=2*-a.positionScreen.x,f=2*-a.positionScreen.y;for(b=0;d>b;b++)c=a.lensFlares[b],c.x=a.positionScreen.x+e*c.distance,c.y=a.positionScreen.y+f*c.distance,c.rotation=0;a.lensFlares[2].y+=.025,a.lensFlares[3].rotation=.5*a.positionScreen.x+THREE.Math.degToRad(45)}function h(a,b,c,d,e,f){var h=new THREE.DirectionalLight(16777215,1.5);h.color.setHSL(a,b,c),h.position.set(d,e,f),h.castShadow=!0,h.shadowDarkness=.8,A.add(h),h=new THREE.PointLight(16777215,1,0),h.color.setHSL(a,b,c),h.position.set(d,e,f);var i=new THREE.Color(16777215);i.setHSL(a,b,c+.5);var j=new THREE.LensFlare(J,700,0,THREE.AdditiveBlending,i);j.add(K,512,0,THREE.AdditiveBlending),j.add(K,512,0,THREE.AdditiveBlending),j.add(K,512,0,THREE.AdditiveBlending),j.add(L,60,.6,THREE.AdditiveBlending),j.add(L,70,.7,THREE.AdditiveBlending),j.add(L,120,.9,THREE.AdditiveBlending),j.add(L,70,1,THREE.AdditiveBlending),j.customUpdateCallback=g,j.position=h.position,A.add(j)}function i(){return H.map(function(a){return a.mesh})}function j(a){I=a,A=new THREE.Scene,A.fog=new THREE.Fog(3355443,300,1e3),E=new THREE.AmbientLight(16777215),E.color.setHSL(.1,.3,.2),A.add(E),h(.995,.5,.9,0,500,300),Config.modeDebug&&u(),B=new THREE.WebGLRenderer({antialias:!0,alpha:!0}),B.setClearColor(3355443),B.shadowMapEnabled=!0,B.shadowMapSoft=!0,z=$("#game"),q(),z.append(B.domElement),window.addEventListener("resize",q,!1),r(),c.onCube(p)}function k(b){I&&d(a,function(){I(b)})}function l(a){for(var b in H)if(H[b].obj&&H[b].obj.id==a.id)return b;return null}function m(a){if(l(a))throw"There is a cube there. Check it before you call addCubeToScene.";var b=new THREE.Mesh(C,G);b.position.x=a.x*Config.dimCadri,b.position.y=a.y*Config.dimCadri,b.position.z=a.z*Config.dimCadri,b.castShadow=!0,b.receiveShadow=!0,A.add(b),H.push({obj:a,mesh:b})}function n(a){A.remove(H[a].mesh),H.splice(a,1)}function o(a){var b=l(a);b?n(b):(console.error("did not find cube"),console.error(a))}function p(a,b){b.date>(new Date).getTime()-1e4&&console.log("cube "+a+" on "+b.x+", "+b.y+", "+b.z),"added"==a?m(b):"removed"==a?o(b):console.error("unknown onCube type "+a)}function q(){D&&(D.camera.aspect=window.innerWidth/window.innerHeight,D.camera.updateProjectionMatrix());var a=window.innerWidth-2*z[0].offsetLeft,b=window.innerHeight-z[0].offsetTop-5;z[0].style.width=a,z[0].style.height=b,B.setSize(a,b)}function r(){function a(a){if(!isLocked){var b=a.movementX||a.mozMovementX||a.webkitMovementX||0,d=a.movementY||a.mozMovementY||a.webkitMovementY||0;D.corps.rotation.y-=.002*b,D.tete.rotation.x-=.002*d,D.tete.rotation.x<-Math.PI/2&&(D.tete.rotation.x=-Math.PI/2),D.tete.rotation.x>Math.PI/2&&(D.tete.rotation.x=Math.PI/2),c.updateRot({corps:D.corps.rotation.y,tete:D.tete.rotation.x})}}var b=function(a){if(!isLocked)switch(a.keyCode){case 90:D.moveForward=!0;break;case 81:D.moveLeft=!0;break;case 83:D.moveBackward=!0;break;case 68:D.moveRight=!0;break;case 32:D.jump(!0);break;case 65:D.getCube();break;case 69:D.putCube();break;case 73:D.toggleInventory()}},d=function(a){switch(a.keyCode){case 38:case 90:D.moveForward=!1;break;case 37:case 81:D.moveLeft=!1;break;case 40:case 83:D.moveBackward=!1;break;case 39:case 68:D.moveRight=!1}};document.addEventListener("mousemove",a,!1),document.addEventListener("keydown",b,!1),document.addEventListener("keyup",d,!1),document.addEventListener("mousewheel",function(a){return isLocked?void 0:(D.camdist(a.wheelDelta),!1)},!1),document.addEventListener("mousedown",x,!1),document.addEventListener("mouseup",y,!1)}function s(){requestAnimationFrame(s),D&&(isLocked||(D.move(),D.jump()),B.render(A,D.camera),D.corps.position.y<-150&&t())}function t(){k("You're dead..."),D.corps.position.x=0,D.corps.position.y=Config.dimCadri+10,D.corps.position.z=0}function u(){F[0]=new w,A.add(F[0].mesh),F[1]=new w,A.add(F[1].mesh),F[2]=new w,A.add(F[2].mesh)}function v(a,b,c,d){c||(c={x:0,y:Config.dimCadri,z:0}),d||(d={corps:0,tete:0}),this.id=a,this.name=b,this.corps=new THREE.Object3D,e(this.corps.position,c);var g=Config.dimCadri,h=new THREE.CubeGeometry(g,g,g),i=new THREE.MeshLambertMaterial({color:16776960}),j=new THREE.Mesh(h,i);this.corps.add(j),j.castShadow=!0,j.receiveShadow=!0;var k=new THREE.CubeGeometry(g/2,g/2,g/2);this.tete=new THREE.Mesh(k,i),this.tete.castShadow=!0,this.tete.receiveShadow=!0,this.tete.position.y=g,this.tete.position.z=g/4,this.corps.add(this.tete);var l=new THREE.TextGeometry(b,{font:"optimer",weight:"normal",style:"normal",size:4,height:.5,curveSegments:2,bevelThickness:.1,bevelSize:.1,bevelEnabled:!0}),m=new THREE.MeshPhongMaterial({color:16755200});this.name_label=new THREE.Mesh(l,m);var n=new THREE.Box3;n.setFromObject(this.name_label);var o=(n.max.x-n.min.x)/2;return this.name_label.position.y=.25*g,this.name_label.position.z=.5*g,this.name_label.position.x=-o,this.corps.add(this.name_label),f(this,d),A.add(this.corps),H.push({mesh:j}),this.move=function(a,b){e(this.corps.position,a),f(this,b)},this}function w(){this.mesh=new THREE.BoxHelper,this.mesh.scale.set(Config.dimCadri/2,Config.dimCadri/2,Config.dimCadri/2),this.mesh.visible=!1}function x(a){if(!isLocked){switch(a.button){case 0:D.dummy.mesh.material.color.setRGB(1,0,0);break;case 1:break;case 2:D.dummy.mesh.material.color.setRGB(0,1,0)}D.dummy.mesh.visible=!0}}function y(a){if(!isLocked)switch(D.dummy.mesh.visible=!1,a.button){case 0:D.getCube();break;case 1:break;case 2:D.putCube()}}var z,A,B,C,D,E,F=[],C=new THREE.CubeGeometry(Config.dimCadri,Config.dimCadri,Config.dimCadri),G=new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture("images/boite.jpg")}),H=[],I=null,J=THREE.ImageUtils.loadTexture("images/lensflare0.png"),K=THREE.ImageUtils.loadTexture("images/lensflare2.png"),L=THREE.ImageUtils.loadTexture("images/lensflare3.png");return{init:function(a){j(a)},animate:function(){s()},addMainPlayer:function(a){D=a,A.add(D.corps)},addPNJ:function(a,b,c,d){return new v(a,b,c,d)},getObjects:function(){return H},getMeshObjects:function(){return i()},addCubeToScene:function(a){m(a)},removeCubeFromScene:function(a){o(a)},removeCubeFromSceneByKey:function(a){n(a)},addGetPutDummy:function(){var a=new w;return A.add(a.mesh),a},addMessage:function(a){k(a)}}}]),angular.module("gameApp.services.mainplayer",[]).factory("MainPlayer",["$rootScope","$location","Db","Session","Game",function(a,b,c,d,e){function f(a,b){a.$$phase||a.$root.$$phase?b():a.$apply(b)}function g(b,g,h,i,j){h||(h={x:0,y:50,z:0});var k=null;d.onUsersLoad(function(){if(k=d.getUser(),k.inventory){var a=$.map(k.inventory,function(a){return[a]});k.inventory=a}else{var b=c.addInventory({type:CubeTypes.WoodBlock});k.inventory=[b]}}),this.dummy=e.addGetPutDummy();var l=Config.distCamPlayer,m=Config.dimCadri/1.5,n=j,o=document.createElement("audio"),p=document.createElement("source");p.src="sounds/ammo_bounce.wav",o.appendChild(p),o.play();var q=!0,r=0,s=new THREE.Vector3(h.x,h.y,h.z);this.name=g,this.jumping=!1,this.corps=new THREE.Object3D,this.corps.position.copy(h);var t=THREE.ImageUtils.loadTexture("images/ash_uvgrid01.jpg");t.wrapS=t.wrapT=THREE.RepeatWrapping,t.anisotropy=16;var u=new THREE.MeshLambertMaterial({ambient:12303291,map:t}),v=Config.dimCadri,w=new THREE.CubeGeometry(v,v,v);this.torse=new THREE.Mesh(w,u),this.torse.castShadow=!0,this.torse.receiveShadow=!0,this.corps.add(this.torse);var x=new THREE.CubeGeometry(v/2,v/2,v/2);this.tete=new THREE.Mesh(x,u),this.tete.castShadow=!0,this.tete.receiveShadow=!0,this.tete.position.y=v,this.tete.position.z=-v/4,this.corps.add(this.tete),this.camera=new THREE.PerspectiveCamera(Config.viewwAngle,window.innerWidth/window.innerHeight,1,1e3),this.camera.position.x+=Math.sin(this.corps.rotation.y)*l,this.camera.position.z+=Math.cos(this.corps.rotation.y)*l,this.tete.add(this.camera),this.updateCamera=function(){this.camera.position.x+=(this.tete.position.x-this.camera.position.x)/10,this.camera.position.y+=(this.tete.position.y-this.camera.position.y-Config.dimCadri/2)/10},this.move=function(){var a=this.canMove();if(a&&(0!=a.x||0!=a.z)){s.copy(this.corps.position),s.x+=a.x*Config.playerSpeed,s.z+=a.z*Config.playerSpeed,this.corps.position.copy(s);var b={x:s.x,y:s.y,z:s.z};c.updatePos(b)}},this.canMove=function(){var a=[],b=[],c=Math.PI/4;a[0]=0,b[0]=0,a[1]=0,b[1]=0,a[2]=0,b[2]=0,this.moveForward&&(a[0]-=Math.sin(this.corps.rotation.y-c),b[0]-=Math.cos(this.corps.rotation.y-c),a[1]-=Math.sin(this.corps.rotation.y),b[1]-=Math.cos(this.corps.rotation.y),a[2]-=Math.sin(this.corps.rotation.y+c),b[2]-=Math.cos(this.corps.rotation.y+c)),this.moveBackward&&(a[0]+=Math.sin(this.corps.rotation.y-c),b[0]+=Math.cos(this.corps.rotation.y-c),a[1]+=Math.sin(this.corps.rotation.y),b[1]+=Math.cos(this.corps.rotation.y),a[2]+=Math.sin(this.corps.rotation.y+c),b[2]+=Math.cos(this.corps.rotation.y+c)),this.moveLeft&&(a[0]-=Math.sin(this.corps.rotation.y+Math.PI/2-c),b[0]-=Math.cos(this.corps.rotation.y+Math.PI/2-c),a[1]-=Math.sin(this.corps.rotation.y+Math.PI/2),b[1]-=Math.cos(this.corps.rotation.y+Math.PI/2),a[2]-=Math.sin(this.corps.rotation.y+Math.PI/2+c),b[2]-=Math.cos(this.corps.rotation.y+Math.PI/2+c)),this.moveRight&&(a[0]-=Math.sin(this.corps.rotation.y-Math.PI/2-c),b[0]-=Math.cos(this.corps.rotation.y-Math.PI/2-c),a[1]-=Math.sin(this.corps.rotation.y-Math.PI/2),b[1]-=Math.cos(this.corps.rotation.y-Math.PI/2),a[2]-=Math.sin(this.corps.rotation.y-Math.PI/2+c),b[2]-=Math.cos(this.corps.rotation.y-Math.PI/2+c));for(var d={x:a[1],z:b[1]},f=e.getMeshObjects(),g=0;3>g;g++){var h=new THREE.Raycaster(this.corps.position,new THREE.Vector3(a[g]*m,0,b[g]*m).normalize()),i=h.intersectObjects(f);i.length>0&&i[0].distance<m&&(o.play(),d=!1)}var j=25;return this.dummy.mesh.position.y=Math.round((this.corps.position.y+Math.sin(this.tete.rotation.x)*j+Config.dimCadri/2)/Config.dimCadri)*Config.dimCadri,this.dummy.mesh.position.x=Math.round((this.corps.position.x-Math.sin(this.corps.rotation.y)*j*Math.cos(this.tete.rotation.x))/Config.dimCadri)*Config.dimCadri,this.dummy.mesh.position.z=Math.round((this.corps.position.z-Math.cos(this.corps.rotation.y)*j*Math.cos(this.tete.rotation.x))/Config.dimCadri)*Config.dimCadri,d},this.jump=function(a){a&&(this.jumping=!0),q&&1==this.jumping&&(q=!1,r=4.3);var b=!0,c=new THREE.Raycaster(this.corps.position,new THREE.Vector3(0,-1,0)),d=c.intersectObjects(e.getMeshObjects());d.length>0&&d[0].distance<m&&(b=!1),0>r&&(this.jumping=!1),b||1==this.jumping?(r>-5&&(r-=.2),this.corps.position.y+=r):(0>r&&(r=0),q=!0,this.jumping=!1)},this.toggleInventory=function(){n&&f(a,function(){n(k.inventory)})},this.getCube=function(){if(k.inventory.length>=Config.maxInventory)return e.addMessage("Too many objects in inventory"),void 0;var a=this.canGet();if(a){var b=e.getObjects();c.remove(b[a].obj.id);var d=c.addInventory({type:CubeTypes.WoodBlock});k.inventory.push(d),e.addMessage(a+" ("+d.id+") put in inventory")}else e.addMessage("No cube here !")},this.canGet=function(){var a=e.getMeshObjects(),b=2*Config.dimCadri,c=new THREE.Vector3(this.corps.position.x+this.tete.position.x,this.corps.position.y+this.tete.position.y,this.corps.position.z+this.tete.position.z),d=new THREE.Vector3(this.dummy.mesh.position.x-c.x,this.dummy.mesh.position.y-c.y,this.dummy.mesh.position.z-c.z).normalize(),f=new THREE.Raycaster(c,d),g=f.intersectObjects(a);if(g.length>0&&g[0].distance<b)for(var h in a)if(a[h].id==g[0].object.id)return h;return null},this.putCube=function(){var a=k.inventory.pop();if(!a)return e.addMessage("Nothing in inventory!"),void 0;var b=this.canGet();if(b)return e.addMessage("There is a cube there"),void 0;var d={x:this.dummy.mesh.position.x/Config.dimCadri,y:this.dummy.mesh.position.y/Config.dimCadri,z:this.dummy.mesh.position.z/Config.dimCadri};c.put(d.x,d.y,d.z,a.type),c.removeInventory(a.id)},this.setCamDist=function(a){var b=5,c=a;b>c&&(c=b),this.camera.position.x=this.tete.position.x+Math.sin(this.tete.rotation.y)*c,this.camera.position.z=this.tete.position.z+Math.cos(this.tete.rotation.y)*c,b>a?(this.camera.fov=Config.viewAngle-a/1.5,this.camera.updateProjectionMatrix()):this.camera.fov!=Config.viewAngle&&(this.camera.fov=Config.viewAngle,this.camera.updateProjectionMatrix())},this.camdist=function(a){l-=a/10,-60>l&&(l=-60),l>300&&(l=300),this.setCamDist(l)},this.setCamDist(Config.distCamPlayer)}return{newPlayer:function(a,b,c,d,e){return new g(a,b,c,d,e)}}}]),angular.module("gameApp.services.notification",[]).factory("Notification",["$rootScope",function(){return{types:{CHAT:{title:"Jethro koull",icon:"http://www.cusi.fr/site/tchat-enfant/im/msn.jpg"}},enable:function(){"undefined"!=typeof webkitNotifications&&0!=webkitNotifications.checkPermission()&&(console.log("no notification permissions"),webkitNotifications.requestPermission())},add:function(a,b){if("undefined"!=typeof webkitNotifications)try{webkitNotifications.createNotification(a.icon,a.title,b).show()}catch(c){console.log(c.message)}}}}]);