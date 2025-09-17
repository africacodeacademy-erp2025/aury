"use client";

import React, { useCallback } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import Image from "next/image";

const PurchaseModal = ({ productId }: { productId: string }) => {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  console.log("Arrived here");
  const fetchClientSecret = useCallback(async () => {
    console.log("Arrived in function");
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });
      console.log("Arrived in function after fetch");

      const data = await response.json();
      if (data?.error) {
        toast.error(data.error);
        throw new Error("Something went wrong");
      }
      return data.client_secret;
    } catch (error) {
      console.error("Error creating checkout session: ", error);
    }
  }, [productId]);

  const options = { fetchClientSecret };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary-600 cursor-pointer">Purchase</Button>
      </DialogTrigger>

      <DialogContent className="my-5 py-6 px-4 sm:px-6 lg:px-10 max-h-[95vh] xl:max-w-screen-xl overflow-y-scroll">
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image
              src="/aury-logo.png"
              alt="Aury Logo"
              width={35}
              height={35}
              className="shrink-0"
            />
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent font-semibold text-lg lg:text-xl">
              Aury
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* EMBEDDED CHECKOUT */}
        <EmbeddedCheckoutProvider options={options} stripe={stripePromise}>
          <EmbeddedCheckout className="w-full h-[60vh] sm:h-[65vh] lg:h-[70vh] max-h-[80vh] overflow-y-scroll" />
        </EmbeddedCheckoutProvider>

        {/* FOOTER */}
        <DialogFooter className="fixed top-[900px] left-0 right-0 xl:static bg-white dark:bg-neutral-900 p-4">
          <div className="w-full">
            <DialogClose asChild>
              <Button className="w-full xl:w-auto cursor-pointer" variant="secondary">
                Cancel Payment
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;
