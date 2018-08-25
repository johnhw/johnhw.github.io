varying vec3 f_color;
uniform float size;
attribute vec3 col_index;
void main()            
{
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    float point_size = 10.0/(gl_Position.w+0.01);
    gl_PointSize = clamp(point_size, 1.0, 20.0);          
    f_color = col_index;          
}