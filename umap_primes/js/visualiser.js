 // for plasma colouring

 var url = new URL(window.location);

 var npy_fname = url.searchParams.get("npy") || '1e6_pts_3d_int16.npy';
 var color_mode = url.searchParams.get("color") || 'factors';
 var simple_points = url.searchParams.get("simple") || false;


 var plasma_cmap = interpolateArray(plasma);
 var n = 1000000;
 var colours = new Float32Array(n * 3);
 var col_data = null;
 var pt_buffer = new THREE.BufferGeometry();

 function filter_points() {
     element = document.getElementById("predicate_text");
     code = "var _pred = function(i) { return " + element.value + ";}";
     eval(code);

     // check if we are filtering, simple colouring, or full colouring
     var test_result = _pred(5);
     if (typeof (test_result) == "boolean") {
         for (i = 0; i < n; i++) {
             if (_pred(i)) {
                 colours[i * 3] = col_data[i * 3] / 255.0;
                 colours[i * 3 + 1] = col_data[i * 3 + 1] / 255.0;
                 colours[i * 3 + 2] = col_data[i * 3 + 2] / 255.0;
             } else {
                 colours[i * 3] = 0.1;
                 colours[i * 3 + 1] = 0.1;
                 colours[i * 3 + 2] = 0.1;
             }
         }
     } else if (typeof (test_result) == "number") {
         for (i = 0; i < n; i++) {
             var rgb = plasma_cmap(_pred(i));
             colours[i * 3] = rgb.r;
             colours[i * 3 + 1] = rgb.g;
             colours[i * 3 + 2] = rgb.b;
         }
     } else if (test_result.length === 3) {
         for (i = 0; i < n; i++) {
             var rgb = _pred(i);
             colours[i * 3] = rgb[0];
             colours[i * 3 + 1] = rgb[1];
             colours[i * 3 + 2] = rgb[2];
         }
     }

     pt_buffer.attributes.color.needsUpdate = true;
 }
 // number theory functions
 nt = ntheory;

 var point_texture = new THREE.TextureLoader().load("bokeh.png");

 /*var material = new THREE.PointsMaterial({
     size: 0.008,
     sizeAttenuation: true,
     vertexColors: THREE.VertexColors,
     opacity: 0.1,

     transparent: true,
     //blending:THREE.AdditiveBlending, 
     depthTest: false

 });

 // add textured points as needed
 if (!simple_points) material.map = point_texture;
 */

 vShader = document.getElementById("vertexshader");
 fShader = document.getElementById("fragmentshader");

var material = new THREE.ShaderMaterial({
  vertexShader:   vShader.text,
  fragmentShader: fShader.text,
  vertexColors: THREE.VertexColors,
  transparent:true,
  depthTest:false,
  blending:THREE.NormalBlending, 
  uniforms: {
    opacity: { value: 0.1 },    
    point: { type: "t", value: point_texture },
    size : { value: 1.0 },
    },
});



 function adjust_exposure(alpha) {
     //material.opacity = alpha * alpha / 4.0;
     material.uniforms.opacity.value = alpha * alpha / 4.0;
     material.needsUpdate = true;
 }

 onloaded = function (pt_array, col_array) {

     var scene = new THREE.Scene();
     var container = document.getElementById("container");
     var camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
     col_data = col_array.data; // expose the col array
     var renderer = new THREE.WebGLRenderer();

     renderer.setSize(container.clientWidth, container.clientHeight);
     container.appendChild(renderer.domElement);

     // animate loop
     function animate() {
         requestAnimationFrame(animate);
         // only update if focused
         if (container === document.activeElement)
             controls.update(1);
         if (!controls.clicked)
             pts.rotateY(0.0015);
         renderer.render(scene, camera);

     }

     var dummy = new THREE.Object3D();
     var controls = new THREE.FlyControls(camera);

     //camera control properties
     controls.movementSpeed = 0.015;
     controls.domElement = renderer.domElement; //window.document;
     controls.container = container;
     controls.rollSpeed = 0.01;

     controls.autoForward = false;
     controls.dragToLook = true;

     scene.add(dummy);
     dummy.add(camera);

     camera.position.z = 5;



     // Create the geometry, and set the attribute arrays



     var pts = new Float32Array(n * 3);
     var mean = [0, 0, 0];
     for (i = 0; i < n; i++) {
         pts[i * 3] = pt_array.data[i * 3] / 32768.0;
         pts[i * 3 + 1] = pt_array.data[i * 3 + 1] / 32768.0;
         pts[i * 3 + 2] = pt_array.data[i * 3 + 2] / 32768.0;
         mean[0] += pts[i * 3];
         mean[1] += pts[i * 3 + 1];
         mean[2] += pts[i * 3 + 2];

     }
     if (color_mode === "factors") {
         for (i = 0; i < n; i++) {
             colours[i * 3] = col_array.data[i * 3] / 255.0;
             colours[i * 3 + 1] = col_array.data[i * 3 + 1] / 255.0;
             colours[i * 3 + 2] = col_array.data[i * 3 + 2] / 255.0;
         }
     } else if (color_mode === "plasma") {
         for (i = 0; i < n; i++) {
             var rgb = plasma_cmap(i / n);
             colours[i * 3] = rgb.r;
             colours[i * 3 + 1] = rgb.g;
             colours[i * 3 + 2] = rgb.b;
         }
     }


     pt_buffer.addAttribute('position', new THREE.BufferAttribute(pts, 3));
     pt_buffer.addAttribute('color', new THREE.BufferAttribute(colours, 3));

     pt_buffer.attributes.color.needsUpdate = true;

     var pts = new THREE.Points(pt_buffer, material);

     pt_buffer.translate(-mean[0] / n, -mean[1] / n, -mean[2] / n);
     pt_buffer.scale(2, 2, 2);

     camera.lookAt(0, 0.0, 0);
     scene.add(pts);

     var three_div = document.createElement('div');
     three_div.className = 'text';
     three_div.innerHTML = "<br>Powered by <a href=\"https://threejs.org/\"> three.js </a>";
     document.body.appendChild(three_div);
     animate();
 }


 function onloaded_stage_1(pt_array) {


     NumpyLoader.ajax("1e6_pts_rgb.npy", function (col_array) {
         onloaded(pt_array, col_array);
     });
 }
 console.log(npy_fname);
 NumpyLoader.ajax(npy_fname, onloaded_stage_1);