"use strict";angular.module("gameApp",["ngCookies","ngResource","ngSanitize","gameApp.services.db","gameApp.services.session","gameApp.services.game"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/game",{templateUrl:"views/game.html",controller:"GameCtrl"}).when("/users",{templateUrl:"views/users.html",controller:"UsersCtrl"}).when("/about",{templateUrl:"views/about.html"}).otherwise({redirectTo:"/"})}]),Date.prototype.getWeek=function(){var a=new Date(this.getFullYear(),0,1);return Math.ceil(((this-a)/864e5+a.getDay()+1)/7)},angular.module("gameApp").controller("MainCtrl",["$rootScope","$scope","$location","$timeout","Db","Session",function(a,b,c,d,e,f){function g(){b.isSignedIn=f.isSignedIn();var a=f.getUser();a&&(b.name=a.name)}b.current_date=(new Date).getTime(),b.weekNumber=(new Date).getWeek(),g(),f.onUsersLoad(g),b.login=function(){f.login(b.name,b.pwd),b.isSignedIn=f.isSignedIn()},b.signup=function(){f.signup(b,b.name,b.email,b.pwd),b.isSignedIn=f.isSignedIn()},b.logout=function(){f.logout(),b.isSignedIn=!1},e.getTchat(function(a,b){$("<div/>").text(b).prepend($("<em/>").text(a+": ")).appendTo($("#messagesDiv")),$("#messagesDiv")[0].scrollTop=$("#messagesDiv")[0].scrollHeight}),b.addMsg=function(a,c){e.addMessage(a,c),b.msg=""}}]),angular.module("gameApp").controller("GameCtrl",["$rootScope","$scope","$timeout","$location","Db","Game","Session",function(a,b,c,d,e,f,g){function h(a){var b=null;return m.some(function(c){return c.id==a?(b=c,void 0):void 0}),b}function i(a,b){var c=h(a);c&&c.move(b.pos,b.rot)}var j=g.getUser();if(!j)return d.path("/"),void 0;var k=f.addMainPlayer(j.name,j.pos);f.init(k);var l=a.users,m=[];for(var n in l)if(l[n].id!=j.id){var k=e.newPlayer(l[n].id,l[n].name,l[n].pos,l[n].rot,i);m.push(f.addPNJ(k.id,k.name,k.pos,k.rot))}console.log(m.length+" pnjs"),f.animate(),$("#instructions").click(function(){enablePointerLock()})}]),angular.module("gameApp").controller("UsersCtrl",["$scope","Db",function(){}]),angular.module("gameApp").controller("HeaderCtrl",["$scope","$location",function(a,b){a.isActive=function(a){return a===b.path()}}]),angular.module("gameApp.services.db",[]).factory("Db",["$rootScope","$location",function(a){function b(a,b){a.$$phase||a.$root.$$phase?b():a.$apply(b)}function c(c){g.once("value",function(d){null!==d.val()&&b(a,function(){c(d.val())})})}function d(c){g.on("child_added",function(d){null!==d.val()&&b(a,function(){c(d.val())})})}function e(a,b,c,d,e){return{id:a,name:b,email:c,pos:d,rot:e}}var f={firebaseUrl:"https://voxelgame.firebaseio.com"},g=new Firebase(f.firebaseUrl+"/users"),h=new Firebase(f.firebaseUrl+"/tchat"),i=new Firebase(f.firebaseUrl+"/cubes"),j=null;return a.users=[],d(function(b){a.users.push(b)}),{getUsers:c,getUser:function(){return j},setUser:function(a){j=a},addUser:function(a,b){var c=g.push().name();g.child(c).set({id:c,name:a,email:b})},newUser:e,newPlayer:function(c,d,e,g,h){var i=new Firebase(f.firebaseUrl+"/users/"+c);return i.on("value",function(d){b(a,function(){h(c,d.val())})}),{id:c,name:d,pos:e,rot:g}},addMessage:function(a,b){h.push({name:a,text:b})},getTchat:function(a){h.on("child_added",function(b){var c=b.val();a(c.name,c.text)})},onNewCube:function(a){i.on("child_added",function(b){var c,d,e,f,g=b.val();for(c in g)for(d in g[c])for(e in g[c][d])f=g[c][d][e].type,a(c,d,e,f)})},put:function(a,b,c,d){j&&i.child("pos").child(a).child(b).child(c).update({type:d,user:j.id,date:(new Date).getTime()})},remove:function(a,b,c){j&&i.child("pos").child(a).child(b).child(c).remove()},updatePos:function(a){if(j){var b=g.child(j.id);b.child("pos").update(a),b.update({date:(new Date).getTime()})}},updateRot:function(a){if(j){var b=g.child(j.id);b.child("rot").update(a),b.update({date:(new Date).getTime()})}}}}]),angular.module("gameApp.services.session",[]).factory("Session",["$rootScope","Db",function(a,b){function c(a){var b=null;return e.some(function(c){return c.name==a?(b=c,void 0):void 0}),b}var d=null,e=[],f=null;return b.getUsers(function(a){for(var c in a)e.push(b.newUser(c,a[c].name,a[c].email,a[c].pos,a[c].rot));f&&f(),console.log("Session: "+e.length+" users")}),{onUsersLoad:function(a){f=a},getUser:function(){return d},isSignedIn:function(){return d?(b.setUser(d),!0):(d=c(readCookie("voxelgame_name")),d&&b.setUser(d),null!=d)},changeLogin:function(a){d=c(a)},login:function(a){d=c(a),d&&(writeCookie("voxelgame_name",d.name,20),b.setUser(d)),console.log(d)},signup:function(e,f){return e.error="",a.users?(d=c(f))?(e.error="User already exists",void 0):(d?(e.error="pseudo "+f+" is already taken",e.name=""):(email||(email=""),b.addUser(f,email),e.pwd="enregistré!",writeCookie("voxelgame_name",f,20),e.error=""),void 0):(e.error="waiting for users to load",void 0)},logout:function(){d=null,writeCookie("voxelgame_name","",20)}}}]),angular.module("gameApp.services.game",[]).factory("Game",["$rootScope","$location","Db",function(a,b,c){function d(a,b){a.x=b.x,a.y=b.y,a.z=b.z}function e(a,b){a.corps.rotation.y=b.corps,a.tete.rotation.x=b.tete}function f(a){w=a,t=new THREE.Scene,t.fog=new THREE.Fog(17476,0,200),x=new THREE.DirectionalLight(17476,1.5),x.position.set(1,1,1),t.add(x),x=new THREE.DirectionalLight(16776960,1.5),x.position.set(-1,-1,-1),t.add(x),y=new THREE.PointLight(16777215,2,50),y.position.set(-1,1,-1),t.add(y),t.add(w.corps),D[10]=new p,t.add(D[10].mesh),l&&l();for(var b=-A[2]/2;b<A[2]/2;b++)for(var d=-A[0]/2;d<A[0]/2;d++)new o({x:d*B,y:0,z:b*B});u=new THREE.WebGLRenderer,u.setClearColor(17476),s=$("#game"),h(),s.append(u.domElement),window.addEventListener("resize",h,!1),i(),c.onNewCube(g)}function g(a,b,c){var d=new THREE.Mesh(v,E);d.position.x=a,d.position.y=b,d.position.z=c,t.add(d),F.push(d)}function h(){w.camera.aspect=window.innerWidth/window.innerHeight,w.camera.updateProjectionMatrix();var a=window.innerWidth-2*s[0].offsetLeft,b=window.innerHeight-2*s[0].offsetTop;u.setSize(a,b),s[0].style.width=a,s[0].style.height=b}function i(){var a=function(a){var b=a.movementX||a.mozMovementX||a.webkitMovementX||0,d=a.movementY||a.mozMovementY||a.webkitMovementY||0;w.corps.rotation.y-=.002*b,w.tete.rotation.x-=.002*d,w.tete.rotation.x<-G/2&&(w.tete.rotation.x=-G/2),w.tete.rotation.x>G/2&&(w.tete.rotation.x=G/2),c.updateRot({corps:w.corps.rotation.y,tete:w.tete.rotation.x})},b=function(a){switch(a.keyCode){case 90:w.moveForward=!0;break;case 81:w.moveLeft=!0;break;case 83:w.moveBackward=!0;break;case 68:w.moveRight=!0;break;case 32:w.jumping=!0,w.jump();break;case 69:w.getCube();break;case 82:w.putCube()}},d=function(a){switch(a.keyCode){case 38:case 87:case 90:w.moveForward=!1;break;case 37:case 65:case 81:w.moveLeft=!1;break;case 40:case 83:w.moveBackward=!1;break;case 39:case 68:w.moveRight=!1}};document.addEventListener("mousemove",a,!1),document.addEventListener("keydown",b,!1),document.addEventListener("keyup",d,!1),document.addEventListener("mousewheel",function(a){return w.camdist(a.wheelDelta),!1},!1),document.addEventListener("mousedown",q,!1)}function j(){requestAnimationFrame(j),r.update(u),w&&(isLocked&&(w.move(),w.jump(),y.position.set(w.corps.position.x,w.corps.position.y,w.corps.position.z)),u.render(t,w.camera),w.corps.position.y<-150&&k())}function k(){w.corps.position.x=0,w.corps.position.y=30,w.corps.position.z=0}function l(){D[0]=new p,t.add(D[0].mesh),D[1]=new p,t.add(D[1].mesh),D[2]=new p,t.add(D[2].mesh)}function m(a,b){var d=8,e=document.createElement("audio"),f=document.createElement("source");f.src="sounds/ammo_bounce.wav",e.appendChild(f),e.play();var g=!0,h=0,i=new THREE.Vector3(b.x,b.y,b.z);this.name=a,this.jumping=!1,this.corps=new THREE.Object3D,this.corps.position.copy(b);var j=THREE.ImageUtils.loadTexture("images/ash_uvgrid01.jpg");j.wrapS=j.wrapT=THREE.RepeatWrapping,j.anisotropy=16;var k=new THREE.MeshLambertMaterial({ambient:12303291,map:j}),m=new THREE.CubeGeometry(B/2,B/2,B/2);this.torse=new THREE.Mesh(m,k),this.corps.add(this.torse);var n=new THREE.CubeGeometry(B/4,B/4,B/4);this.tete=new THREE.Mesh(n,k),this.tete.position.y=B/2,this.tete.position.z=-5,this.corps.add(this.tete),this.camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,1e3),this.camera.position.x+=Math.sin(this.corps.rotation.y)*C,this.camera.position.z+=Math.cos(this.corps.rotation.y)*C,this.tete.add(this.camera),this.move=function(){i.copy(this.corps.position);var a=this.canMove();a&&(i.x+=a[0],i.z+=a[1],this.corps.position.copy(i),c.updatePos({x:i.x,y:i.y,z:i.z}))},this.canMove=function(){var a=[],b=[],c=G/4;a[0]=0,b[0]=0,a[1]=0,b[1]=0,a[2]=0,b[2]=0,this.moveForward&&(a[0]-=Math.sin(this.corps.rotation.y-c),b[0]-=Math.cos(this.corps.rotation.y-c),a[1]-=Math.sin(this.corps.rotation.y),b[1]-=Math.cos(this.corps.rotation.y),a[2]-=Math.sin(this.corps.rotation.y+c),b[2]-=Math.cos(this.corps.rotation.y+c)),this.moveBackward&&(a[0]+=Math.sin(this.corps.rotation.y-c),b[0]+=Math.cos(this.corps.rotation.y-c),a[1]+=Math.sin(this.corps.rotation.y),b[1]+=Math.cos(this.corps.rotation.y),a[2]+=Math.sin(this.corps.rotation.y+c),b[2]+=Math.cos(this.corps.rotation.y+c)),this.moveLeft&&(a[0]-=Math.sin(this.corps.rotation.y+G/2-c),b[0]-=Math.cos(this.corps.rotation.y+G/2-c),a[1]-=Math.sin(this.corps.rotation.y+G/2),b[1]-=Math.cos(this.corps.rotation.y+G/2),a[2]-=Math.sin(this.corps.rotation.y+G/2+c),b[2]-=Math.cos(this.corps.rotation.y+G/2+c)),this.moveRight&&(a[0]-=Math.sin(this.corps.rotation.y-G/2-c),b[0]-=Math.cos(this.corps.rotation.y-G/2-c),a[1]-=Math.sin(this.corps.rotation.y-G/2),b[1]-=Math.cos(this.corps.rotation.y-G/2),a[2]-=Math.sin(this.corps.rotation.y-G/2+c),b[2]-=Math.cos(this.corps.rotation.y-G/2+c));for(var f=[a[1],b[1]],g=0;3>g;g++){var h=new THREE.Raycaster(this.corps.position,new THREE.Vector3(a[g]*d,0,b[g]*d).normalize()),i=h.intersectObjects(F);i.length>0&&i[0].distance<d&&(e.play(),f=!1),l&&(D[g].mesh.position.y=this.corps.position.y,D[g].mesh.position.x=this.corps.position.x+a[g]*d,D[g].mesh.position.z=this.corps.position.z+b[g]*d)}var j=25;return D[10].mesh.position.y=20*Math.round((this.corps.position.y+Math.sin(this.tete.rotation.x)*j+10)/20),D[10].mesh.position.x=20*Math.round((this.corps.position.x-Math.sin(this.corps.rotation.y)*j*Math.cos(this.tete.rotation.x))/20),D[10].mesh.position.z=20*Math.round((this.corps.position.z-Math.cos(this.corps.rotation.y)*j*Math.cos(this.tete.rotation.x))/20),f},this.jump=function(){g&&1==this.jumping&&(g=!1,h=4);var a=!0,b=new THREE.Raycaster(this.corps.position,new THREE.Vector3(0,-1,0)),c=b.intersectObjects(F);c.length>0&&c[0].distance<d&&(a=!1),0>h&&(this.jumping=!1),a||1==this.jumping?(h>-5&&(h-=.2),this.corps.position.y+=h):(0>h&&(h=0),g=!0,this.jumping=!1)},this.getCube=function(){var a=this.canGet();a&&console.log("ok dans l'inventaire, enfin presque...")},this.canGet=function(){var a=12,b=-Math.sin(this.corps.rotation.y),d=-Math.cos(this.corps.rotation.y),e=new THREE.Raycaster(this.corps.position,new THREE.Vector3(b*a,0,d*a).normalize()),f=e.intersectObjects(F);if(f.length>0&&f[0].distance<a){t.remove(f[0].object);for(var g in F)F[g].id==f[0].object.id&&(c.remove(F[g].position.x,F[g].position.y,F[g].position.z),F.splice(g,1));return!0}return!1},this.putCube=function(){if(D[10].mesh.visible){var a=new THREE.Mesh(v,E);a.position.x=Math.round(D[10].mesh.position.x/B)*B,a.position.y=Math.round(D[10].mesh.position.y/B)*B,a.position.z=Math.round(D[10].mesh.position.z/B)*B,t.add(a),F.push(a),D[10].mesh.visible=!1,c.put(a.position.x,a.position.y,a.position.z,z)}else D[10].mesh.visible=!0},this.canPut=function(){var a=12;if(-Math.sin(this.corps.rotation.y),-Math.cos(this.corps.rotation.y),intersects.length>0&&intersects[0].distance<a){t.remove(intersects[0].object);for(var b in F)F[b].id==intersects[0].object.id&&F.splice(b,1);return!0}return!1},this.setCamDist=function(a){C=a,this.camera.position.x=this.tete.position.x+Math.sin(this.tete.rotation.y)*C,this.camera.position.z=this.tete.position.z+Math.cos(this.tete.rotation.y)*C},this.camdist=function(a){C-=a/60,0>C&&(C=0),C>100&&(C=100),this.setCamDist(C)},this.setCamDist(40)}function n(a,b,c,f){this.id=a,this.name=b,this.corps=new THREE.Object3D,d(this.corps.position,c);var g=new THREE.CubeGeometry(B/2,B/2,B/2),h=new THREE.MeshLambertMaterial({color:16776960});this.torse=new THREE.Mesh(g,h),this.corps.add(this.torse);var i=new THREE.CubeGeometry(B/4,B/4,B/4);return this.tete=new THREE.Mesh(i,h),this.tete.position.y=B/2,this.corps.add(this.tete),e(this,f),t.add(this.corps),F.push(this.torse),this.move=function(a,b){d(this.corps.position,a),e(this,b)},this}function o(a){var b=new THREE.Mesh(v,E);b.position.copy(a),t.add(b),F.push(b)}function p(){this.mesh=new THREE.BoxHelper,this.mesh.material.color.setRGB(0,1,0),this.mesh.scale.set(10,10,10),this.mesh.position.y=20,this.mesh.position.x=15,this.mesh.visible=!1}function q(a){switch(a.button){case 0:w.getCube();break;case 1:break;case 2:w.putCube()}}var r=new THREEx.RendererStats;r.domElement.style.position="absolute",r.domElement.style.left="0px",r.domElement.style.bottom="0px",document.body.appendChild(r.domElement);var s,t,u,v,w,x,y,z=1,l=!1,A=[12,20,12],B=20,C=(Date.now(),0),D=[],v=new THREE.CubeGeometry(B,B,B),E=new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture("images/boite.jpg")}),F=(new THREE.Vector3,[]),G=Math.PI;return{init:function(a){f(a)},animate:function(){j()},addMainPlayer:function(a,b){return new m(a,b)},addPNJ:function(a,b,c,d){return new n(a,b,c,d)}}}]);