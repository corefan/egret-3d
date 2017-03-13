var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var egret3d;
(function (egret3d) {
    /**
    * @class egret3d.IndexBuffer3D
    * @classdesc
    * IndexBuffer3D 用于表示顶点索引列表，由图形子系统保留的图形元素构成。</p>
    * VertexBuffer3D 类表示上载到渲染上下文的一组顶点数据。</p>
    * 使用 VertexBuffer3D 对象定义与一组顶点中每个点相关联的数据。</p>
    * 您可以从 Vector 数组或 ByteArray 上载顶点数据。（上载完成后，将不再引用原始数组中的数据；更改或放弃源数组不会更改顶点数据。）</p>
    * 与每个顶点相关联的数据采用应用程序定义的格式，并用作顶点着色器程序的输入。</p>
    * 使用 Context3DProxy.vertexAttribPointer  函数标识哪些值属于哪个顶点程序输入。</p>
    * 一个顶点程序最多可以使用 8 个输入（也称为顶点属性寄存器）。</p>
    * 每个输入可能需要 1 到 4 个 32 位值。</p>
    * 例如，一个顶点的 [x,y,z] 位置坐标可以作为包含 3 个 32 位值的矢量传递到顶点程序。</p>
    * 您最多可以为每个点提供 64 个 32 位值（256 字节）数据（但在这种情况下，单个顶点着色器无法使用所有数据）。</p>
    * 注意：由于现在索引是Uint16 所以顶点个数不能超过65535
    * @see egret3d.Context3DProxy
    * @see egret3d.CubeTexture
    * @see egret3d.IndexBuffer3D
    * @version Egret 3.0
    * @platform Web,Native
    */
    var VertexBuffer3D = (function () {
        /**
        * @language zh_CN
        * 构造
        * @param buffer WebGLBuffer
        * @version Egret 3.0
        * @platform Web,Native
        */
        function VertexBuffer3D(buffer) {
            this.buffer = buffer;
        }
        /**
        * @language zh_CN
        * 释放接口
        */
        VertexBuffer3D.prototype.dispose = function () {
            if (this.buffer) {
                egret3d.Context3DProxy.gl.deleteBuffer(this.buffer);
                this.buffer = null;
            }
            if (this.arrayBuffer) {
                delete this.arrayBuffer;
                this.arrayBuffer = null;
            }
        };
        return VertexBuffer3D;
    }());
    egret3d.VertexBuffer3D = VertexBuffer3D;
    __reflect(VertexBuffer3D.prototype, "egret3d.VertexBuffer3D");
})(egret3d || (egret3d = {}));
//# sourceMappingURL=VertexBuffer3D.js.map