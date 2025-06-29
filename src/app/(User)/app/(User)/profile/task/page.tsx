"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Square } from "lucide-react";
import React from "react";

const Task = () => {
  return (
    <div>
      <Card>
        <div className="flex flex-box">
          <CardContent>
            <Square size={50} className=""/>
          </CardContent>
          <div className="grid grid-box">
            <CardTitle>Task 1</CardTitle>
            <CardDescription>change your display user name</CardDescription>
          </div>
          <div className="absolute right-0">
            <CardContent>
              <Button>Completed</Button>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-box">
          <CardContent>
            <Square size={50} className="" />
          </CardContent>
          <div className="grid grid-box">
            <CardTitle>Task 2</CardTitle>
            <CardDescription>change your display user name</CardDescription>
          </div>
          <div className="absolute right-0">
            <CardContent>
              <Button>Completed</Button>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-box">
          <CardContent>
            <Square size={50} className="" />
          </CardContent>
          <div className="grid grid-box">
            <CardTitle>Task 3</CardTitle>
            <CardDescription>change your display user name</CardDescription>
          </div>
          <div className="absolute right-0">
            <CardContent>
              <Button>Completed</Button>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-box">
          <CardContent>
            <Square size={50} className="" />
          </CardContent>
          <div className="grid grid-box">
            <CardTitle>Task 4</CardTitle>
            <CardDescription>change your display user name</CardDescription>
          </div>
          <div className="absolute right-0">
            <CardContent>
              <Button>Completed</Button>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-box">
          <CardContent>
            <Square size={50} className=""/>
          </CardContent>
          <div className="grid grid-box">
            <CardTitle>Task 5</CardTitle>
            <CardDescription>change your display user name</CardDescription>
          </div>
          <div className="absolute right-0">
            <CardContent>
              <Button>Completed</Button>
            </CardContent>
          </div>
        </div>
      </Card>
      </div>
  );
};

export default Task;
