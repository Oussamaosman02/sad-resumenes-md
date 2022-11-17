---
layout: ./../../layouts/LayoutMD.astro
title: "Ejercicios"
---

# Ejercicios sobre NFT

---

---

Dada la arquitectura de red que hemos usado en clase:

- Una máquina cliente
- Un equipo Ubuntu con dos tarjetas de red que actúa de cortafuegos.

Elabora los ficheros necesarios para conseguir lo siguiente:

Nota: los ejercicios 1 y 2 son fundamentales para resolver el resto de ejercicios. Si no consigues la conectividad mínima no podrás hacer nada. Asegúrate de que puedes hacer ping entre todos los nodos y de que la navegación funciona correctamente en el cliente y en el router. En el router puedes instalar "links", el navegador en modo texto que te permite visitar páginas. Una vez instalado usa "links http://www.google.es" y comprueba que te muestra la página web.

## 1. Configuración de direcciones

---

Suponiendo que tu número de equipo es el 100 (reemplaza el 100 por el número de tu puesto en todos los supuestos) haz lo siguiente:

- Usando netplan configura el equipo cliente para que tenga estos datos

  - IP: 172.16.100.10
  - Máscara: 255.255.255.0
  - Gateway: 172.16.100.1
  - DNS1: 10.1.0.1
  - DNS2: 8.8.8.8

- Usando netplan configura el equipo servidor para que tenga estos datos:
  - Tarjeta enp0s3 
  	- IP: 172.16.100.1 
	- Máscara: 255.255.255.0
  - Tarjeta enp0s8: 
  	- IP: 10.8.(50+100).1 
	- Máscara 255.255.0.0 
	- Gateway: 10.8.0.254 
	- DNS1: 10.1.0.1 
	- DNS2: 8.8.8.8

## 2. NAT

---

Configura el router Ubuntu para que acepte tráfico por la tarjeta enp0s3 y lo saque por la enp0s8 realizando el NAT correspondiente.

De aquí en adelante, cada ejercicio es independiente de los demás. CONSTRUYE UN NUEVO FICHERO /etc/nftables.conf para cada uno o al menos toma medidas para no mezclar los ejercicios (comentar reglas anteriores o similar)

```bash
#/etc/nftables.conf
#!/usr/sbin/nft -f
flush ruleset
table inet tablaNAT{
	chain entrada{
	  type nat  hook prerouting  priority  -100;
          policy accept;
	}
	chain salida{
	   type nat hook postrouting priority  -100;
	   oifname "enp0s8" masquerade;
	}
}
```

## 3. Ping

---

Se desea evitar que el equipo cliente haga ping a la IP 8.8.8.8. El resto de mensajes de ping deben funcionar con normalidad.

```bash
#!/usr/sbin/nft -f
flush ruleset
table inet tablaNAT{
	chain entrada{
	  type nat  hook prerouting  priority  -100;
          policy accept;
	}
	chain salida{
	   type nat hook postrouting priority  -100;
	   oifname "enp0s8" masquerade;
	}
}
#Esto resuelve el problema de prohibir el ping
#a una cierta IP de destino
table inet filtradoEj3{
      chain filtradoPing{
         type filter hook prerouting priority 0;
	 policy accept;
	 ip daddr 10.1.0.1 icmp type echo-request drop;
      }
}
```

## 4. Evitar tráfico HTTP

---

Se desea evitar que los clientes naveguen por páginas inseguras. Para ello se desea prohibir el tráfico a páginas http pero aceptar el tráfico https. Puedes hacer pruebas intentando conectar con la página http://192.168.1.13 (no debería funcionar, pero sí debería funcionar https://www.google.com)

```bash
#!/usr/sbin/nft -f
flush ruleset
table inet tablaNAT{
	chain entrada{
	  type nat  hook prerouting  priority  -100;
          policy accept;
	}
	chain salida{
	   type nat hook postrouting priority  -100;
	   oifname "enp0s8" masquerade;
	}
}
#Ej 4: Restringir http pero permitir https
table inet filtradoHTTP{
      chain filtradoHTTP{
         type filter hook postrouting priority 0;
	 tcp dport {80} drop;
      }
}
```

## 5. Prohibir redes enteras

---

Se ha observado un abuso de navegación. Se desea prohibir el tráfico HTTP y HTTPS a toda la red 172.16.100.0/24. Recuerda que necesitarás cambiar el 100 por tu número de puesto.

```bash
#!/usr/sbin/nft -f
flush ruleset
table inet tablaNAT{
	chain entrada{
	  type nat  hook prerouting  priority  -100;
          policy accept;
	}
	chain salida{
	   type nat hook postrouting priority  -100;
	   oifname "enp0s8" masquerade;
	}
}
#Ej 5: Restringir http a red completa
table inet filtradoHTTP{
      chain filtradoHTTP{
         type filter hook postrouting priority 0;
	 ip saddr 172.16.100.0/24
	    tcp dport {80,443} drop;
      }
}
```

## 6. Restringir velocidad

---

Se desea regular el tráfico basándonos en un reparto del ancho de banda. Para ello se va a reservar un tráfico de 100KBytes por segundo para el 172.16.100.10 y 1000Kbytes para el 172.16.100.20. Si cambias la IP en el cliente deberás notar que las descargas van más lentas si usas la IP 172.16.100.10 comparado con usar la IP 172.16.100.20. Recuerda que deberás cambiar el 100 por tu número de puesto. Cuando hayas terminado este ejercicio quizá deberás volver a cambiar la IP por 172.16.100.10

## 7. Limitar volumen

---

Se desea llevar un control del volumen descargado por el 172.16.100.10. Para ello se le va a poner una cuota límite de 10 Mbytes. Comprueba que superado dicho límite todo deja de funcionar. Si cambias la IP a 172.16.100.20 todo debería volver a la normalidad.

## 8. Acceso a servidor web

---

Si no lo tienes, instala un servidor web dentro del router Ubuntu. Escribe un fichero que permita que el 172.16.100.10 pueda acceder a él, pero que el resto de equipos VENGAN DE DONDE VENGAN, no puedan acceder a él.

## 9.-Apertura de puertos

---

Si no lo tienes, instala un servidor web dentro del router Ubuntu. Consigue que los equipos de la red 172.16.100.0/24 NO PUEDAN ACCEDER A ÉL pero que el resto del equipos del exterior SÍ PUEDAN ACCEDER A ÉL.
````
