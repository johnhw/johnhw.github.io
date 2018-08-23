 // for plasma colouring

 var url = new URL(window.location);

 var npy_fname = url.searchParams.get("npy") || '1e6_pts_3d_int16.npy';
 var color_mode = url.searchParams.get("color") || 'factors';
 var simple_points = url.searchParams.get("simple") || false;


 var primes; // Int32 array of primes
 var plasma_cmap = interpolateArray(plasma);
 var n = 1000000;
 var colours = new Float32Array(n * 3);
 var col_data = null;
 var pt_buffer = new THREE.BufferGeometry();
 var index_pt_buffer = new THREE.BufferGeometry();

 // create colours to use as lookup indices
 var index_colors = new Float32Array(n * 3);
 for(var k=0;k<n;k++)
 {     
    var i = k;
    index_colors[k*3] = ((i>>16)&0xff)/255.0;
    index_colors[k*3+1] = ((i>>8)&0xff)/255.0;
    index_colors[k*3+2] = ((i>>0)&0xff)/255.0;

 }
 var n_selected = n;
 function filter_points() {
     element = document.getElementById("predicate_text");
     code = "var _pred = function(i) { return " + element.value + ";}";
     eval(code);

     // check if we are filtering, simple colouring, or full colouring
     var test_result = _pred(5);
     
     if (typeof (test_result) == "boolean") {
         n_selected = 0;
         for (i = 0; i < n; i++) {
             if (_pred(i)) {
                 n_selected += 1;
                 colours[i * 3] = col_data[i * 3] / 255.0;
                 colours[i * 3 + 1] = col_data[i * 3 + 1] / 255.0;
                 colours[i * 3 + 2] = col_data[i * 3 + 2] / 255.0;
             } else {
                 colours[i * 3] = 0.0;
                 colours[i * 3 + 1] = 0.0;
                 colours[i * 3 + 2] = 0.0;
             }
         }
     } else if (typeof (test_result) == "number") {
         n_selected = n;
         for (i = 0; i < n; i++) {
             var rgb = plasma_cmap(_pred(i));
             colours[i * 3] = rgb.r;
             colours[i * 3 + 1] = rgb.g;
             colours[i * 3 + 2] = rgb.b;
         }
     } else if (test_result.length === 3) {
        n_selected = n;
         for (i = 0; i < n; i++) {
             var rgb = _pred(i);
             colours[i * 3] = rgb[0];
             colours[i * 3 + 1] = rgb[1];
             colours[i * 3 + 2] = rgb[2];
         }
     }
     else if(test_result.length>3)
     {
        n_selected = test_result.length;
         // allow an explicit list of indices to highlight
        for (i = 0; i < n; i++) {
            
            colours[i * 3] = 0.0;
            colours[i * 3 + 1] = 0.0;
            colours[i * 3 + 2] = 0.0;
        }
        for(k=0;k<test_result.length;k++)
        {
            var i = test_result[k];
            colours[i * 3] = col_data[i * 3] / 255.0;
            colours[i * 3 + 1] = col_data[i * 3 + 1] / 255.0;
            colours[i * 3 + 2] = col_data[i * 3 + 2] / 255.0;
        }
     }

     pt_buffer.attributes.color.needsUpdate = true;
 }
 // number theory functions
 nt = ntheory;

 var point_texture = new THREE.TextureLoader().load("point.png");



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

vMouseShader = document.getElementById("vertexmouseshader");
fMouseShader = document.getElementById("fragmentmouseshader");

var index_material = new THREE.ShaderMaterial({
    vertexShader:   vMouseShader.text,
    fragmentShader: fMouseShader.text,
    vertexColors: THREE.VertexColors,
    transparent:false,
    depthTest:true,
    blending:THREE.NoBlending, 
    uniforms: {            
      size : { value: 1.0 },
      },
  });




 function adjust_exposure(alpha) {     
     material.uniforms.opacity.value = alpha * alpha / 4.0;
     material.needsUpdate = true;
 }

 onloaded = function (pt_array, col_array) {

     var scene = new THREE.Scene();
     var container = document.getElementById("container");
     var camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
     col_data = col_array.data; // expose the col array
     var renderer = new THREE.WebGLRenderer();
     var bufferTexture = new THREE.WebGLRenderTarget(container.clientWidth,  container.clientHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter});
 
     var pts, index_buffer_pts;
     renderer.setSize(container.clientWidth, container.clientHeight);
     container.appendChild(renderer.domElement);
     var tooltip = document.getElementById("number_tooltip");

     // animate loop
     function animate() {
        var read = new Uint8Array(4);
        pts.visible=false;
        index_buffer_pts.visible=true;
        renderer.render(scene, camera, bufferTexture);
        renderer.readRenderTargetPixels( bufferTexture, controls.mouseRenderX, controls.mouseRenderY, 1, 1, read );
        // convert color back into integer index        
        var index = ((read[0]<<16) + (read[1]<<8) + (read[2]));
        // adjust size to compensate if we only select a few values
        material.uniforms.size.value = Math.sqrt(n/(n_selected+1));
        if(index!==0 && controls.tooltips)
        {                    
            tooltip.style.left = (controls.mousePageX-100) + "px";
            tooltip.style.top = (controls.mousePageY-20) + "px";
            tooltip.style.display = 'block';
            tooltip.innerHTML = index;
        }
        else
        {
            tooltip.style.display = 'none';
        }

         requestAnimationFrame(animate);
         // only update if focused
         if (container === document.activeElement)
             controls.update(1);
         if (!controls.clicked)
         {
             pts.rotateY(0.0015);
             index_buffer_pts.rotateY(0.0015);
         }

        pts.visible=true;
        index_buffer_pts.visible=false;
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
     pt_buffer.addAttribute('col_index', new THREE.Float32BufferAttribute(index_colors, 3));
     
     pt_buffer.attributes.color.needsUpdate = true;
    
     pt_buffer.translate(-mean[0] / n, -mean[1] / n, -mean[2] / n);
     pt_buffer.scale(2, 2, 2);

     pts = new THREE.Points(pt_buffer, material);     
     index_buffer_pts = new THREE.Points(pt_buffer, index_material);     

     camera.lookAt(0, 0.0, 0);
     scene.add(pts);
     scene.add(index_buffer_pts);

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
 
NumpyLoader.ajax(npy_fname, onloaded_stage_1);



function set_primes(array)
{
    primes = array.data;    
    composites = new Float32Array(n-primes.length);
    var ix = 0;
    var prime_ix = 0;
    for(i=2;i<n;i++)
    {
        if(i===primes[prime_ix])
        {
            prime_ix ++;
        }
        else
        {
            composites[ix++] = i;
        }
    }    
}

NumpyLoader.ajax("primes_1e6_uint32.npy", set_primes);