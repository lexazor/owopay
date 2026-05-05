"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "./auth-context";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001", {
      query: { userId: user.id },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
    };
  }, []);

  return { socket: socketRef.current, on };
}
