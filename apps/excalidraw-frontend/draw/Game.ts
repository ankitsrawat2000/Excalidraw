import { HTTP_BACKEND } from "@/config";
import { getExistingShapes } from "./http";
import { Tool } from "@/components/Canvas";
import axios from "axios";

type Shape =
  | {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
  }
  | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
  }
  | {
    type: "pencil";
    points: { x: number; y: number }[];
  };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = null;
  private currentPath: { x: number; y: number }[] = [];
  socket: WebSocket;

  private viewportTransform = { x: 0, y: 0, scale: 1 };
  private isPanning = false;
  private lastPanX = 0;
  private lastPanY = 0;

  private spacePressed = false;

  private undoStack: Shape[] = [];
  private redoStack: Shape[] = [];

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
    this.initPanZoomHandlers();
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("wheel", this.onMouseWheel);

    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);

  }

  setTool(tool: "circle" | "pencil" | "rect" | "hand" | "eraser" | null) {
    this.selectedTool = tool;
    this.clicked = false;
    this.isPanning = false;

    if (tool === "hand") {
      this.canvas.style.cursor = "grab";
    } else if (tool === "eraser") {
      this.canvas.style.cursor = "crosshair";
    } else {
      this.canvas.style.cursor = "default";
      this.spacePressed = false;
    }
  }


  async init() {
    const shapes = await getExistingShapes(this.roomId);
    this.existingShapes = shapes.reverse();
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsed = JSON.parse(message.message);
        parsed.shape.id = message.clientId;
        const exists = this.existingShapes.some(
          (s: any) => s.id === message.clientId
        );
        if (!exists) {
          this.existingShapes.push(parsed.shape);
        }
        this.clearCanvas();
      }

      if (message.type === "delete_shape") {
        const { id } = message;
        this.existingShapes = this.existingShapes.filter(
          (shape: any) => shape.id !== id
        );
        this.clearCanvas();
        return;
      }
    };
  }

  clearCanvas() {
    const { x, y, scale } = this.viewportTransform;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(scale, 0, 0, scale, x, y);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(-x / scale, -y / scale, this.canvas.width / scale, this.canvas.height / scale);

    this.existingShapes.forEach((shape) => {
      this.ctx.strokeStyle = "white";

      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil") {
        this.ctx.beginPath();
        const pts = shape.points;
        if (pts.length > 1) {
          this.ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            this.ctx.lineTo(pts[i].x, pts[i].y);
          }
          this.ctx.stroke();
        }
        this.ctx.closePath();
      }
    });
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault();
      this.spacePressed = true;
      this.canvas.style.cursor = "grab";
    }
  };

  onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      this.spacePressed = false;
      this.canvas.style.cursor = "default";
    }
  };


  onMouseWheel = (e: WheelEvent) => {
    e.preventDefault();
    const { x, y, scale } = this.viewportTransform;
    const rect = this.canvas.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.2, scale + delta), 5); // clamp scale 0.2–5

    const newX = localX - (localX - x) * (newScale / scale);
    const newY = localY - (localY - y) * (newScale / scale);

    this.viewportTransform = { x: newX, y: newY, scale: newScale };
    this.clearCanvas();
  };

  zoomIn() {
    this.viewportTransform.scale = Math.min(this.viewportTransform.scale * 1.1, 5);
    this.clearCanvas();
  }
  zoomOut() {
    this.viewportTransform.scale = Math.max(this.viewportTransform.scale / 1.1, 0.2);
    this.clearCanvas();
  }

  panStart = (e: MouseEvent) => {
    const isHandTool = this.selectedTool === "hand";
    if (this.spacePressed || isHandTool) {
      this.isPanning = true;
      this.lastPanX = e.clientX;
      this.lastPanY = e.clientY;
      this.canvas.style.cursor = "grabbing";
    } else {
      this.mouseDownHandler(e);
    }
  };

  panMove = (e: MouseEvent) => {
    if (!this.isPanning) return;
    const dx = e.clientX - this.lastPanX;
    const dy = e.clientY - this.lastPanY;
    this.viewportTransform.x += dx;
    this.viewportTransform.y += dy;
    this.lastPanX = e.clientX;
    this.lastPanY = e.clientY;
    this.clearCanvas();
  };
  panEnd = () => {
    this.isPanning = false;
    this.canvas.style.cursor =
      this.selectedTool === "hand" ? "grab" :
        this.spacePressed ? "grab" : "default";
  };


  initPanZoomHandlers() {
    this.canvas.addEventListener("wheel", this.onMouseWheel);
    this.canvas.addEventListener("mousedown", this.panStart);
    this.canvas.addEventListener("mousemove", this.panMove);
    this.canvas.addEventListener("mouseup", this.panEnd);
    this.canvas.addEventListener("mouseleave", this.panEnd);
  }

  private addShape(shape: Shape) {
    this.existingShapes.push(shape);
    this.undoStack.push(shape);
    this.redoStack = [];
    this.clearCanvas();
  }

  async undo() {
    if (this.existingShapes.length === 0) return;
    const shape = this.existingShapes.pop()!;
    this.redoStack.push(shape);
    this.clearCanvas();

    if ((shape as any).id) {
      this.socket.send(
        JSON.stringify({
          type: "delete_shape",
          id: (shape as any).id,
          roomId: this.roomId
        })
      );
    }
  }


  redo() {
    if (this.redoStack.length === 0) return;
    const shape = this.redoStack.pop()!;
    this.existingShapes.push(shape);
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        clientId: (shape as any).id,
        roomId: this.roomId,
      })
    );
    this.clearCanvas();
  }

  mouseDownHandler = (e: MouseEvent) => {
    if (this.spacePressed || this.isPanning) return;
    this.clicked = true;
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const { x, y, scale } = this.viewportTransform;
    this.startX = (screenX - x) / scale;
    this.startY = (screenY - y) / scale;

    if (this.selectedTool === "pencil") {
      this.currentPath = [{ x: this.startX, y: this.startY }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (this.spacePressed || this.isPanning) return;
    this.clicked = false;
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const { x, y, scale } = this.viewportTransform;
    const endX = (screenX - x) / scale;
    const endY = (screenY - y) / scale;
    const width = endX - this.startX;
    const height = endY - this.startY;
    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        height,
        width,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      };
    } else if (selectedTool === "pencil") {
      if (this.currentPath.length > 1) {
        shape = {
          type: "pencil",
          points: [...this.currentPath],
        };
      }
    }

    if (!shape) return;
    const clientId = crypto.randomUUID();
    (shape as any).id = clientId;

    this.addShape(shape);
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        clientId,       
        roomId: this.roomId,
      })
    );

    this.currentPath = [];
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.spacePressed || this.isPanning) return;

    if (!this.clicked) return;

    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const { x, y, scale } = this.viewportTransform;
    const worldX = (screenX - x) / scale;
    const worldY = (screenY - y) / scale;


    if (this.selectedTool === "rect" || this.selectedTool === "circle") {
      const width = worldX - this.startX;
      const height = worldY - this.startY;
      this.clearCanvas();
      this.ctx.strokeStyle = "white";
      if (this.selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else {
        const radius = Math.max(width, height) / 2;
        const centerX = this.startX + radius;
        const centerY = this.startY + radius;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    } else if (this.selectedTool === "pencil") {
      this.currentPath.push({ x: worldX, y: worldY });
      const len = this.currentPath.length;
      if (len > 1) {
        const prev = this.currentPath[len - 2];
        this.ctx.beginPath();
        this.ctx.moveTo(prev.x, prev.y);
        this.ctx.lineTo(worldX, worldY);
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
      }
    } else if (this.selectedTool === "eraser") {
      const eraseRadius = 10; // size of eraser "brush"
      const toErase: number[] = [];

      // find shapes that are near the current cursor
      this.existingShapes.forEach((shape, index) => {
        if (shape.type === "rect") {
          if (
            worldX > shape.x - eraseRadius &&
            worldX < shape.x + shape.width + eraseRadius &&
            worldY > shape.y - eraseRadius &&
            worldY < shape.y + shape.height + eraseRadius
          ) {
            toErase.push(index);
          }
        } else if (shape.type === "circle") {
          const dx = worldX - shape.centerX;
          const dy = worldY - shape.centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < shape.radius + eraseRadius) {
            toErase.push(index);
          }
        } else if (shape.type === "pencil") {
          // check if any segment point is close
          for (let i = 0; i < shape.points.length; i++) {
            const p = shape.points[i];
            const dx = worldX - p.x;
            const dy = worldY - p.y;
            if (Math.sqrt(dx * dx + dy * dy) < eraseRadius) {
              toErase.push(index);
              break;
            }
          }
        }
      });

      // remove erased shapes
      if (toErase.length > 0) {
        // push deleted shapes to undoStack for restoration
        const removed = toErase.map(i => this.existingShapes[i]);
        this.undoStack.push(...removed);
        this.existingShapes = this.existingShapes.filter((_, i) => !toErase.includes(i));
        this.clearCanvas();

        removed.forEach(shape => {
          this.socket.send(JSON.stringify({
            type: "delete_shape",
            id: (shape as any).id,
            roomId: this.roomId
          }));
        });
      }
    }

  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
