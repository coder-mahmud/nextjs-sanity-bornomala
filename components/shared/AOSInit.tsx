"use client";

import { useEffect } from "react";
import AOS from "aos";


export default function AOSInit() {
  useEffect(() => {

    setTimeout(() => {
      AOS.init({
        once: false,
        // duration: 800,
        easing: "ease-out-cubic",
      });
  
      AOS.refresh();
    }, 100);



    // AOS.init({
    //   // duration: 800,
    //   once: true,
    //   // offset: 200,
    //   // startEvent: 'load',
    // });


    // AOS.refresh(); // 👈 ensures recalculation
    // window.addEventListener("load", () => {
    //   AOS.refresh();
    // });
  }, []);

  return null; // nothing to render
}
