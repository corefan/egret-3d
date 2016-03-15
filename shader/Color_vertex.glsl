﻿attribute vec3 attribute_position ;
attribute vec3 attribute_normal ;
attribute vec3 attribute_tangent ;
attribute vec4 attribute_color ;

uniform mat4 uniform_ModelMatrix ;
uniform mat4 uniform_ProjectionMatrix ;
uniform mat4 uniform_normalMatrix ;
uniform vec3 uniform_eyepos ;

varying vec4 varying_pos        ;
varying vec3 varying_eyeNormal  ;
varying vec4 varying_color  ;
varying vec3 varying_eyedir  ;
 
vec4 endPosition ;

mat4 buildMat4(int index){

  vec4 quat = uniform_PoseMatrix[index * 2 + 0];

  vec4 translation = uniform_PoseMatrix[index * 2 + 1];

  float xx = quat.x * quat.x;
  float xy = quat.x * quat.y;
  float xz = quat.x * quat.z;
  float xw = quat.x * quat.w;

  float yy = quat.y * quat.y;
  float yz = quat.y * quat.z;
  float yw = quat.y * quat.w;

  float zz = quat.z * quat.z;
  float zw = quat.z * quat.w;

   return mat4(
	   1.0 - 2.0 * (yy + zz),		2.0 * (xy + zw),		2.0 * (xz - yw),		0,
	   2.0 * (xy - zw),				1.0 - 2.0 * (xx + zz),	2.0 * (yz + xw),		0,
	   2.0 * (xz + yw),				2.0 * (yz - xw),		1.0 - 2.0 * (xx + yy),	0,
	   translation.x,				translation.y,			translation.z,			1
   );
}

void main(void){

   endPosition = vec4(0.0, 0.0, 0.0, 0.0) ;

   vec4 temp_position = vec4(attribute_position, 1.0) ;

   endPosition =  uniform_ModelMatrix * temp_position ;

   varying_eyedir = uniform_eyepos ;
   varying_pos =  endPosition ;

   endPosition = uniform_ProjectionMatrix * endPosition ;
   
   varying_eyeNormal =  (uniform_normalMatrix*vec4(attribute_normal,0.0) ).xyz ;

   varying_color = attribute_color ;
}