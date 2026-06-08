import { AfterInit, BaseProvider } from "@main/utils/baseProvider";
import { IpcContext, IpcHandle } from "@main/utils/onIpcEvent";
import { App, IpcMainInvokeEvent } from "electron";

import { getWindowFromContents } from "../utils/webContentUtils";
import { createAppWindow, wrapWindowHandler } from "../utils/windowUtils";

@IpcContext
export default class MiniPlayerProvider extends BaseProvider implements AfterInit {
	constructor(private _app: App) {
		super("mp");
	}
	get app() {
		return this._app;
	}
	async AfterInit() {}
	@IpcHandle("action:miniplayer.stayOnTop")
	private async __onPlayerTop(ev: IpcMainInvokeEvent) {
		const window = getWindowFromContents(ev.sender);
		if (!window || window.isDestroyed()) return false;
		const isOnTop = !window.isAlwaysOnTop();
		window.setAlwaysOnTop(isOnTop);
		return isOnTop;
	}
	@IpcHandle("miniplayer.stayOnTop")
	private async __isPlayerTop(ev: IpcMainInvokeEvent) {
		const window = getWindowFromContents(ev.sender);
		if (!window || window.isDestroyed()) return false;
		const isOnTop = window.isAlwaysOnTop();
		return isOnTop;
	}
	@IpcHandle("action:app.miniPlayer")
	@IpcHandle("app.miniPlayer")
	private async __playerWindow() {
		let mpId: number;
		let mpWindow = this.windowContext.views.miniPlayerWindow;
		if (!mpWindow || mpWindow.isDestroyed()) {
			this.windowContext.views.miniPlayerWindow = mpWindow = await createAppWindow({
				path: "/miniplayer",
				minWidth: 320,
				minHeight: 115,
				maxWidth: 480,
				maxHeight: 340,
				height: 340,
				width: 340,
			});

			const { state, saveState } = await wrapWindowHandler(mpWindow, "miniPlayer", {
				width: 340,
				height: 340,
			});

			let startWidth = 340;
			let startHeight = 340;
			if (state) {
				startWidth = state.width;
				startHeight = state.height;
			}

			const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

			// Determine layout mode based on dimensions and apply limits
			if (startHeight <= 160) {
				mpWindow.setMinimumSize(320, 115);
				mpWindow.setMaximumSize(380, 120);
				if (state && typeof state.x === "number") {
					mpWindow.setBounds({ x: state.x, y: state.y, width: clamp(startWidth, 320, 380), height: 115 });
				} else {
					mpWindow.setSize(340, 115);
				}
			} else if (startWidth / startHeight <= 1.25) {
				mpWindow.setMinimumSize(320, 320);
				mpWindow.setMaximumSize(360, 360);
				if (state && typeof state.x === "number") {
					mpWindow.setBounds({ x: state.x, y: state.y, width: clamp(startWidth, 320, 360), height: clamp(startHeight, 320, 360) });
				} else {
					mpWindow.setSize(340, 340);
				}
			} else {
				mpWindow.setMinimumSize(400, 150);
				mpWindow.setMaximumSize(480, 180);
				if (state && typeof state.x === "number") {
					mpWindow.setBounds({ x: state.x, y: state.y, width: clamp(startWidth, 400, 480), height: clamp(startHeight, 150, 180) });
				} else {
					mpWindow.setSize(440, 160);
				}
			}

			mpWindow.setMinimizable(true);
			this.windowContext.main.hide();
			mpWindow.on("close", () => {
				this.windowContext.main.show();
				saveState();
			});
			mpId = mpWindow.id;
		} else {
			mpId = mpWindow.id;
			mpWindow.show();
		}
		this.windowContext.sendToAllViews("miniplayer.state", !this.views.miniPlayerWindow ? null : { active: false });
		return mpId;
	}
	@IpcHandle("action:miniplayer.setLayout")
	private async __setLayout(ev: IpcMainInvokeEvent, mode: "vertical" | "horizontal" | "slim") {
		const window = getWindowFromContents(ev.sender);
		if (!window || window.isDestroyed()) return false;

		if (mode === "vertical") {
			window.setMinimumSize(320, 320);
			window.setMaximumSize(360, 360);
			window.setSize(340, 340);
		} else if (mode === "horizontal") {
			window.setMinimumSize(400, 150);
			window.setMaximumSize(480, 180);
			window.setSize(440, 160);
		} else if (mode === "slim") {
			window.setMinimumSize(320, 115);
			window.setMaximumSize(380, 120);
			window.setSize(340, 115);
		}
		return true;
	}
}
