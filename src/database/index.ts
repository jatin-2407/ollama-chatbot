import mongoose from "mongoose";
import { config } from "@/config";

export const dbInit = () => mongoose.connect(config.databaseUri);
