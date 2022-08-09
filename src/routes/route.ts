import {Router} from "express";

export abstract class Route {
  abstract get router(): Router
}