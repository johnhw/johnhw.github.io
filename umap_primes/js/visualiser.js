 // for plasma colouring

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
     if(typeof(test_result)=="boolean")
     {
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
    }
    else if(typeof(test_result)=="number")
    {
       for (i = 0; i < n; i++) {
           var rgb = plasma_cmap(_pred(i));           
            colours[i * 3] = rgb.r;
            colours[i * 3 + 1] = rgb.g;
            colours[i * 3 + 2] = rgb.b;        
       }
   }
   else if(test_result.length===3)
   {
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
         if(container===document.activeElement)
            controls.update(1);
         renderer.render(scene, camera);
     }

     var dummy = new THREE.Object3D();
     var controls = new THREE.FlyControls(camera);

     //camera control properties
     controls.movementSpeed = 0.015;
     controls.domElement = container; //window.document;
     controls.rollSpeed = 0.01;

     controls.autoForward = false;
     controls.dragToLook = true;

     scene.add(dummy);
     dummy.add(camera);

     camera.position.z = 5;



     // Create the geometry, and set the attribute arrays



     var pts = new Float32Array(n * 3);
     for (i = 0; i < n; i++) {
         /* var rgb = plasma_cmap(i/n);
                    
         colours[i*3] = rgb.r;
         colours[i*3+1] = rgb.g;
         colours[i*3+2] = rgb.b;                    */

         pts[i * 3] = pt_array.data[i * 3] / 32768.0;
         pts[i * 3 + 1] = pt_array.data[i * 3 + 1] / 32768.0;
         pts[i * 3 + 2] = pt_array.data[i * 3 + 2] / 32768.0;
         colours[i * 3] = col_array.data[i * 3] / 255.0;
         colours[i * 3 + 1] = col_array.data[i * 3 + 1] / 255.0;
         colours[i * 3 + 2] = col_array.data[i * 3 + 2] / 255.0;
     }

     pt_buffer.addAttribute('position', new THREE.BufferAttribute(pts, 3));
     pt_buffer.addAttribute('color', new THREE.BufferAttribute(colours, 3));

     pt_buffer.attributes.color.needsUpdate = true;
     var material = new THREE.PointsMaterial({
         size: 0.008,
         sizeAttenuation: true,
         vertexColors: THREE.VertexColors,
         opacity: 0.1,
         transparent: true,
         //blending:THREE.AdditiveBlending, 
         depthTest: false

     });
     var pts = new THREE.Points(pt_buffer, material);
     pt_buffer.scale(2, 2, 2);
     camera.lookAt(0, 0.7, 0);
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

 NumpyLoader.ajax("1e6_pts_3d_int16.npy", onloaded_stage_1);