module egret3d {

    /**
    * @private
    * @language zh_CN
    * @class egret3d.QuadTree
    * @classdesc
    * 四叉树
    * @version Egret 3.0
    * @platform Web,Native
    */
    export class QuadTree {

        /**
        * @language zh_CN
        * 所有节点
        * @version Egret 3.0
        * @platform Web,Native
        */
        private _cells: Array<QuadTreeCell>;

        /**
        * @language zh_CN
        * 根节点
        * @version Egret 3.0
        * @platform Web,Native
        */
        private _rootCell: QuadTreeCell;

        /**
        * @language zh_CN
        * 节点列表
        * @version Egret 3.0
        * @platform Web,Native
        */
        private _quadNodes: Array<IQuadNode>;

        /**
        * @language zh_CN
        * 当前tree的包围盒
        * @version Egret 3.0
        * @platform Web,Native
        */
        private _aabb: QuadAABB;

        /**
        * @language zh_CN
        * 碰撞检测用数组
        * @version Egret 3.0
        * @platform Web,Native
        */
        private _cellsToTest: Array<number>;

        /**
        * @language zh_CN
        * 碰撞检测用批次
        * @version Egret 3.0
        * @platform Web,Native
        */
        private _testID: number;


        /**
        * @language zh_CN
        * constructor
        * @version Egret 3.0
        * @platform Web,Native
        */
        constructor() {
            this._testID = 0;
            this._cells = new Array<QuadTreeCell>();
            this._quadNodes = new Array<IQuadNode>();
            this._cellsToTest = new Array<number>();
            this._aabb = new QuadAABB();
        }

        /**
        * @language zh_CN
        * 根据下标获取node对象
        * @param    idx     下标
        * @version Egret 3.0
        * @platform Web,Native
        */
        public getQuadNode(idx: number): IQuadNode {
            return this._quadNodes[idx];
        }

        /**
        * @language zh_CN
        * 清理
        * @version Egret 3.0
        * @platform Web,Native
        */
        public clear(): void {
            this._cells.length = 0;
            this._quadNodes.length = 0;
        }


        /**
        * @language zh_CN
        * 插入一系列node到树中,不build
        * @param    nodes     待初始化的节点列表
        * @version Egret 3.0
        * @platform Web,Native
        */
        public initNodes(nodes: Array<IQuadNode>): void {
            this.clear();
            var i: number = 0;
            var count: number = nodes.length;
            while (i < count) {
                nodes[i].calcGlobalQuadAABB();
                this._quadNodes.push(nodes[i]);
                i++;
            }

        }

        /**
        * @language zh_CN
        * 构建四叉树
        * @param    maxNodesPerCell     一个Cell中最多几个三角
        * @param    minCellSize         一个cell单元最小划分到多小
        * @version Egret 3.0
        * @platform Web,Native
        */
        public buildQuadTree(maxNodesPerCell: number, minCellSize: number): void {
            this._aabb.clear();

            for (var node of this._quadNodes) {
                if (node.isTriangle) {
                    for (var vt of node.aabb.points) {
                        this._aabb.addPoint(vt);
                    }
                }
                else {
                    this._aabb.setContainRect(node.aabb.minPosX, node.aabb.minPosY, node.aabb.maxPosX, node.aabb.maxPosY);
                }
            }

            this._cells.length = 0;
            this._rootCell = new QuadTreeCell(this._aabb);		// 创建根节点
            this._cells.push(this._rootCell);

            var numTriangles: number = this._quadNodes.length;
            for (var i: number = 0; i < numTriangles; i++) {
                this._cells[0].nodeIndices[i] = i;			// 先把所有的三角面放到根节点上
            }

            var cellsToProcess: Array<number> = new Array<number>();
            cellsToProcess.push(0);

            var iTri: number;
            var cellIndex: number;
            var childCell: QuadTreeCell;
            while (cellsToProcess.length != 0) {
                cellIndex = cellsToProcess.pop();
                if (this._cells[cellIndex].nodeIndices.length <= maxNodesPerCell
                    || this._cells[cellIndex].aabb.radius < minCellSize) {
                    continue;		// 该cell中还可以放三角面
                }

                for (i = 0; i < QuadTreeCell.NUM_CHILDREN; i++) {
                    this._cells[cellIndex].childCellIndices[i] = this._cells.length;
                    cellsToProcess.push(this._cells.length);
                    this._cells.push(new QuadTreeCell(this.createAABox(this._cells[cellIndex].aabb, i)));

                    childCell = this._cells[this._cells.length - 1];

                    // 父节点上的三角型往子节点中放
                    numTriangles = this._cells[cellIndex].nodeIndices.length;
                    var pushCount: number = 0;
                    for (var j: number = 0; j < numTriangles; j++) {
                        iTri = this._cells[cellIndex].nodeIndices[j];

                        if (this.doesNodeIntersectCell(this._quadNodes[iTri], childCell)) {
                            pushCount++;
                            childCell.nodeIndices.push(iTri);
                        }
                    }
                }
                this._cells[cellIndex].nodeIndices.length = 0;
            }

            //logTree(0);
        }

        /**
        * @language zh_CN
        * 创建子节点的AABox
        * @param    aabb     包围盒
        * @param    id      象限
        * @version Egret 3.0
        * @platform Web,Native
        */
        private createAABox(aabb: QuadAABB, id: number): QuadAABB {
            var centerX: number = aabb.centreX;
            var centerY: number = aabb.centreY;
            var dimX: number = aabb.sideX;
            var dimY: number = aabb.sideY;

            var result: QuadAABB = new QuadAABB();
            switch (id) {
                case 0:		// 1象限
                    result.setAABox(centerX + dimX / 4, centerY + dimY / 4, dimX / 2, dimY / 2);
                    break;
                case 1:		// 2象限
                    result.setAABox(centerX - dimX / 4, centerY + dimY / 4, dimX / 2, dimY / 2);
                    break;
                case 2:		// 3象限
                    result.setAABox(centerX - dimX / 4, centerY - dimY / 4, dimX / 2, dimY / 2);
                    break;
                case 3:		// 4象限
                    result.setAABox(centerX + dimX / 4, centerY - dimY / 4, dimX / 2, dimY / 2);
                    break;
                default:
                    result.setAABox(centerX + dimX / 4, centerY - dimY / 4, dimX / 2, dimY / 2);
                    break;
            }

            return result;
        }


        /**
        * @language zh_CN
        * 如果三角型和Cell相交,返回True
        * @param    node     节点
        * @param    cell     四叉树叶子
        * @version Egret 3.0
        * @platform Web,Native
        */
        private doesNodeIntersectCell(node: IQuadNode, cell: QuadTreeCell): Boolean {
            // boundingbox要重叠
            var box: QuadAABB = node.aabb;
            if (!box.overlapTest(cell.aabb)) {
                return false;
            }
            //如果不是三角形，则只需要检测aabb的相交
            if (!node.isTriangle)
                return true;

            var points: Array<Vector3> = box.points;
            var p1: Vector3 = points[0];
            var p2: Vector3 = points[1];
            var p3: Vector3 = points[2];

            if (cell.aabb.isPointInside(p1) ||
                cell.aabb.isPointInside(p2) ||
                cell.aabb.isPointInside(p3)) {	// 三角型有顶点在cell中
                return true;
            }

            // cell的顶点在三角型中
            var isIntersect: Boolean =
                this.pointInTriangle(cell.aabb.minPosX, cell.aabb.minPosY, p1, p2, p3) ||
                this.pointInTriangle(cell.aabb.minPosX, cell.aabb.maxPosY, p1, p2, p3) ||
                this.pointInTriangle(cell.aabb.maxPosX, cell.aabb.maxPosY, p1, p2, p3) ||
                this.pointInTriangle(cell.aabb.maxPosX, cell.aabb.minPosY, p1, p2, p3);

            if (isIntersect)
                return true;


            // 三角形的边是否与AABB的边相交
            isIntersect = cell.aabb.isIntersectLineSegment(p1.x, p1.z, p2.x, p2.z) ||
                cell.aabb.isIntersectLineSegment(p1.x, p1.z, p3.x, p3.z) ||
                cell.aabb.isIntersectLineSegment(p2.x, p2.z, p3.x, p3.z);

            return isIntersect;
        }

        /**
        * @language zh_CN
        * 寻找在某位置上的三角面
        * @param    result     存储节点的数组
        * @param    aabb       包围盒
        * @version Egret 3.0
        * @platform Web,Native
        */
        public getNodesIntersectingtAABox(result: Array<number>, aabb: QuadAABB): number {
            if (this._cells.length == 0)
                return 0;
            this._cellsToTest.length = 0;
            this._cellsToTest.push(0);

            this.incrementTestCounter();

            var cellIndex: number, nTris: number, cell: QuadTreeCell;
            var nodeBox: QuadAABB;
            var i: number = 0;
            while (this._cellsToTest.length != 0) {
                cellIndex = this._cellsToTest.pop();

                cell = this._cells[cellIndex];

                if (!aabb.overlapTest(cell.aabb)) {
                    continue;
                }

                if (cell.isLeaf()) {
                    nTris = cell.nodeIndices.length;
                    for (i = 0; i < nTris; i++) {
                        nodeBox = this.getQuadNode(cell.nodeIndices[i]).aabb;
                        if (nodeBox.testID != this._testID) {
                            nodeBox.testID = this._testID;
                            if (aabb.overlapTest(nodeBox)) {
                                result.push(cell.nodeIndices[i]);
                            }
                        }
                    }
                } else {
                    for (i = 0; i < QuadTreeCell.NUM_CHILDREN; i++) {
                        this._cellsToTest.push(cell.childCellIndices[i]);
                    }
                }
            }
            return result.length;

        }

        /**
        * @language zh_CN
        * 判断点在三角型中
        * @param    x           指定点坐标x
        * @param    y           指定点坐标y
        * @param    triPi1      三角形顶点1
        * @param    triPi2      三角形顶点2
        * @param    triPi3      三角形顶点3
        * @returns  是否包含
        * @version Egret 3.0
        * @platform Web,Native
        */
        private pointInTriangle(x: number, y: number, triP1: Vector3, triP2: Vector3, triP3: Vector3): boolean {
            var p1: Vector3 = triP1;
            var p2: Vector3 = triP2;
            var p3: Vector3 = triP3;

            // 直线方程p1-p2
            var A1: number = p1.z - p2.z;
            var B1: number = p2.x - p1.x;
            var C1: number = p1.x * p2.z - p2.x * p1.z;
            // 直线方程p2-p3
            var A2: number = p2.z - p3.z;
            var B2: number = p3.x - p2.x;
            var C2: number = p2.x * p3.z - p3.x * p2.z;
            // 直线方程p3-p1
            var A3: number = p3.z - p1.z;
            var B3: number = p1.x - p3.x;
            var C3: number = p3.x * p1.z - p1.x * p3.z;

            var isInTri: boolean = false;
            var D1: number = A1 * x + B1 * y + C1;
            var D2: number = A2 * x + B2 * y + C2;
            var D3: number = A3 * x + B3 * y + C3;

            const Tiny: number = 0.01;
            if ((D1 >= -Tiny && D2 >= -Tiny && D3 >= -Tiny) || (D1 <= Tiny && D2 <= Tiny && D3 <= Tiny))
                isInTri = true;

            return isInTri;
        }

        /**
        * @language zh_CN
        * 递增批次
        * @version Egret 3.0
        * @platform Web,Native
        */
        private incrementTestCounter(): void {
            ++this._testID;
            if (this._testID == 0) {
                var numTriangles: number = this._quadNodes.length;
                for (var i: number = 0; i < numTriangles; i++) {
                    this._quadNodes[i].aabb.testID = 0;
                }
                this._testID = 1;
            }
        }

        /**
        * @language zh_CN
        * 显示quadtree结构
        * @version Egret 3.0
        * @platform Web,Native
        */
        private logDeep: number = 0;
        private logTree(cellIndex: number): void {
            if (cellIndex < 0)
                return;

            this.logDeep++;

            var cell: QuadTreeCell = this._cells[cellIndex];

            var spaces: String = "";
            for (var si: number = 0; si < (this.logDeep - 1); si++)
                spaces += "-|";

            console.log(spaces + "i=" + cellIndex + " " +
                cell.aabb.minPosX.toFixed(2) + " " + cell.aabb.maxPosX.toFixed(2) + " "
                + cell.aabb.minPosY.toFixed(2) + " " + cell.aabb.maxPosY.toFixed(2));

            var i: number;
            for (i = 0; i < cell.nodeIndices.length; i++) {
                if (cell.nodeIndices[i] >= 0) {
                    var tri: IQuadNode = this._quadNodes[cell.nodeIndices[i]];
                    console.log(spaces + " t=" + cell.nodeIndices[i] + " " +
                        tri.aabb.minPosX.toFixed(2) + " " + tri.aabb.maxPosX.toFixed(2) + " "
                        + tri.aabb.minPosY.toFixed(2) + " " + tri.aabb.maxPosY.toFixed(2));

                }
            }
            for (i = 0; i < cell.childCellIndices.length; i++) {
                if (cell.childCellIndices[i] >= 0) {
                    this.logTree(cell.childCellIndices[i]);
                }
            }
            this.logDeep--;
        }

    }

}