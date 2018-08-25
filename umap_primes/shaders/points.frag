precision highp float;
varying vec3 f_color;
varying float f_opacity;
uniform sampler2D point;

void main()
{
    gl_FragColor 	= vec4(f_color, f_opacity * texture2D(point, gl_PointCoord));
}