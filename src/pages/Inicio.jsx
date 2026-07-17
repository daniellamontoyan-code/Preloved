import { useState } from "react";

import { loginUsuario } from "../lib/usuarios";


export default function Inicio(){


  const [nombre,setNombre] = useState("");

  const [password,setPassword] = useState("");




  async function ingresar(){


    if(!nombre.trim() || !password.trim()){

      alert("Completa los datos");

      return;

    }



    const usuario = await loginUsuario(

      nombre,

      password

    );



    if(!usuario){

      alert("Usuario o contraseña incorrectos");

      return;

    }



    localStorage.setItem(

      "usuario",

      usuario.nombre

    );


    localStorage.setItem(

      "usuario_id",

      usuario.id

    );



    window.location.href="/";


  }





return (

<div

style={{

minHeight:"100vh",

background:"#FAFAFC",

display:"flex",

justifyContent:"center",

alignItems:"center",

padding:"32px",

}}

>


<div

style={{

width:"100%",

maxWidth:"380px",

textAlign:"center",

}}

>


<h1

style={{

fontSize:"64px",

fontWeight:"800",

background:"linear-gradient(90deg,#8B5CF6,#EC4899,#F97316)",

WebkitBackgroundClip:"text",

WebkitTextFillColor:"transparent",

}}

>

Preloved

</h1>



<p

style={{

fontSize:"24px",

fontWeight:"700",

color:"#1F2937",

marginBottom:"35px",

}}

>

Tu espacio para organizar

<br/>

todo lo que vendes ✨

</p>




<input

value={nombre}

onChange={(e)=>setNombre(e.target.value)}

placeholder="Usuario"

style={{

width:"100%",

height:"58px",

borderRadius:"20px",

border:"1px solid #E5E7EB",

padding:"0 20px",

fontSize:"18px",

marginBottom:"15px",

boxSizing:"border-box",

}}

/>




<input

type="password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

placeholder="Contraseña"

style={{

width:"100%",

height:"58px",

borderRadius:"20px",

border:"1px solid #E5E7EB",

padding:"0 20px",

fontSize:"18px",

marginBottom:"20px",

boxSizing:"border-box",

}}

/>




<button

onClick={ingresar}

style={{

width:"100%",

height:"58px",

border:"none",

borderRadius:"20px",

background:"#7C5CFC",

color:"#FFFFFF",

fontSize:"20px",

fontWeight:"600",

}}

>

Ingresar

</button>



</div>


</div>


);


}