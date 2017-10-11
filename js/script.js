
/* 変数の宣言と描画領域の設定 */

var canvasWidth  = window.innerWidth;
var canvasHeight = window.innerHeight;

var camera, scene, renderer, stats;
var light;

var loader = new THREE.TextureLoader();
var map_moon = loader.load( "./texture/level3.jpg" );
var map_moon_normal = loader.load( "./texture/level2_normal.png" );

init();
animate();

function init() {

	initScene();
	initMisc();

	document.getElementById( "three-js" ).appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );

}

function initScene() {

	camera = new THREE.PerspectiveCamera( 45, canvasWidth / canvasHeight, 1, 8000 );
	camera.position.set( 0, 0, 35 );
	scene = new THREE.Scene();
	scene.add( new THREE.AmbientLight( 0x111111 ) );

	light = new THREE.DirectionalLight( 0xFFFFFF, 1.8 );
	light.position.set( 0, 0, 100 );
	light.target.position.set( 0, 0, 0 );
	scene.add( light );

	moon = new THREE.Mesh(
		new THREE.SphereGeometry( 10, 64, 64 ),
		new THREE.MeshPhongMaterial({
			color: 0x999999,
			specular: 0xFFFFFF,
			shininess: 0,
			normalMap: map_moon_normal,
			map: map_moon,
			normalScale: new THREE.Vector2(1, 1)
		})
	);
	moon.position.set(0,0,0);
	moon.rotation.y = -1.5; // 正面出し
	scene.add( moon );

	var geometry = new THREE.Geometry();
	var material = new THREE.PointsMaterial({
		vertexColors: true,
		size: 1,
		sizeAttenuation: false
	});

	get( "./csv/HipparcosCatalogue.csv" ).then(function( csvData ) {

		var stars = parseCSV( csvData );

		var brightStars = [];
		for ( var i in stars ) {
			var star = stars[i];
			var ra = star[3] * Math.PI / 180;
			var dec = star[4] * Math.PI / 180;
			var dist = 1500;
			var x = dist * Math.cos( ra ) * Math.cos( dec );
			var y = dist * Math.sin( ra ) * Math.cos( dec );
			var z = dist * Math.sin( dec );
			star.position = new THREE.Vector3( x, z, -y );

			var alpha = 1 - star[2] / 10;
			alpha = (alpha < 0.1) ? 0.1 : (alpha > 1 ? 1 : alpha);
			star.color = new THREE.Color( parseInt( star[6] ) );
			star.color.r *= alpha;
			star.color.g *= alpha;
			star.color.b *= alpha;

			if ( star[2] < 4.0 ) {
				brightStars.push( star );
			} else {
				geometry.vertices.push( star.position );
				geometry.colors.push( star.color );
			}
		}

		var particleSystem = new THREE.Points( geometry, material );
		scene.add( particleSystem );

		for ( var i in brightStars ) {
			var star = brightStars[i];
			var r = 3 - star[2] * 0.4;
			var c = star.color;
			var mesh = new THREE.Mesh(
				new THREE.SphereGeometry(r, 4, 4),
				new THREE.MeshBasicMaterial({
					color: c,
					blending: THREE.AdditiveBlending
				})
			);
			mesh.position.set( star.position.x, star.position.y, star.position.z );
			scene.add(mesh);
		}

		console.log(scene);

	});
}

function initMisc() {

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setClearColor( 0,1 );
	renderer.setPixelRatio( window.devicePixelRatio );

	// Mouse control
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 0, 0 );
	controls.autoRotate = true;
	controls.autoRotateSpeed = -0.5;
	controls.zoomSpeed = 0.5;
	controls.minDistance = 15;
	controls.maxDistance = 300;
	controls.minPolarAngle = Math.PI * 2 / 6;
	controls.maxPolarAngle = Math.PI * 4 / 6;
}

function onWindowResize() {

	camera.aspect = canvasWidth / canvasHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	render();

}

function render() {

	moon.rotation.y += 0.0008;
//	light.position.x = Math.sin( new Date().getTime() / 5000 ) * 200;
//	light.position.z = Math.cos( new Date().getTime() / 5000 ) * 200;

//	camera.position.set( Math.sin( new Date().getTime() / 100000 ) * 30, 0, Math.cos( new Date().getTime() / 100000 ) * 30 );


	controls.update();
	renderer.render( scene, camera );

}
