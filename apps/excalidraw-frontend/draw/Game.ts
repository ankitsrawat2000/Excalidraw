import { getExistingShapes } from "./http";
import { Tool } from "@/components/Canvas";

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

  // 🆕 viewport transform
  private viewportTransform = { x: 0, y: 0, scale: 1 };
  private isPanning = false;
  private lastPanX = 0;
  private lastPanY = 0;

  private spacePressed = false;


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
    this.initPanZoomHandlers(); // 🆕

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("wheel", this.onMouseWheel); // 🆕

    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);

  }

  setTool(tool: "circle" | "pencil" | "rect" | "hand" | null) {
    this.selectedTool = tool;
    this.clicked = false;
    this.isPanning = false;
  
    if (tool === "hand") {
      this.canvas.style.cursor = "grab";
    } else {
      this.canvas.style.cursor = "default";
      this.spacePressed = false;
    }
  }
  

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    const { x, y, scale } = this.viewportTransform;

    // Reset and apply transform
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

  // 🆕 Zoom controls (for buttons)
  zoomIn() {
    this.viewportTransform.scale = Math.min(this.viewportTransform.scale * 1.1, 5);
    this.clearCanvas();
  }
  zoomOut() {
    this.viewportTransform.scale = Math.max(this.viewportTransform.scale / 1.1, 0.2);
    this.clearCanvas();
  }

  // 🆕 Pan (right mouse drag or hold space)
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

    this.existingShapes.push(shape);
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
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
      // add to path
      this.currentPath.push({ x: worldX, y: worldY });

      // draw segment
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
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
