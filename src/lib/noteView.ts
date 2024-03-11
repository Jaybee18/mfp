import Vex from 'vexflow';

export function onLoad() {
    console.log("load");
    test();
}

function test() {
    const element = document.getElementById("notes");

    const data = `
    tabstave notation=true key=A time=4/4
  
    notes :q =|: (5/2.5/3.7/4) :8 7-5h6/3 ^3^ 5h6-7/5 ^3^ :q 7V/4 |
    notes :8 t12p7/4 s5s3/4 :8 3s:16:5-7/5 :q p5/4
    text :w, |#segno, ,|, :hd, , #tr
    `
  
    const VF = Vex.Flow
    
    const renderer = new VF.Renderer(element,
        VF.Renderer.Backends.SVG);
    
    // Initialize VexTab artist and parser.
}