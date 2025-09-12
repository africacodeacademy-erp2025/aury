import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

interface EmptyStateProps {
  imageSrc: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
}
const EmptyState = ({
  imageSrc,
  title,
  description,
  buttonText,
  buttonHref,
}: EmptyStateProps) => {
  return (
    <div className="global-bg">
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <Image
          src={imageSrc}
          alt="No issues"
          width={350}
          height={350}
          quality={100}
          className="h-auto"
        />

        <div className="text-center max-w-lg mt-7">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p>{description}</p>
        </div>

        {buttonText && buttonHref && (
          <Button asChild>
            <Link href={buttonHref} className="bg-primary-600 mt-5">
              {buttonText}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
