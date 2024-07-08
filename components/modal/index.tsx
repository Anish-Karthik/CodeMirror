'use client';

import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const DialogModel = ({
  children,
  trigger,
  title,
  className,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  title: string;
  className?: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger className="">{trigger}</DialogTrigger>
      <DialogContent className="p-12">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{children}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DialogModel;
