varying vec3 f_color;
uniform float size;
varying float f_opacity;
uniform float opacity;
void main()            
{
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    float point_size = size/(gl_Position.w+0.01);
    if(color.r==0.0 && color.g==0.0 && color.b==0.0)
    {
        point_size = 1.0;
        f_opacity = 0.1;
        f_color = vec3(0.1, 0.1, 0.1);
    }
    else 
    {
        gl_PointSize = clamp(point_size, 1.0, 20.0);
        f_opacity = clamp(point_size, 0.0, 1.0)*opacity;
        f_color = color;
    }
    
    
}