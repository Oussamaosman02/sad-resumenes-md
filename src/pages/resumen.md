---
layout: ./../layouts/LayoutMD.astro
---

# Cortafuegos

## comandos

- sudo nft list ruleset > `FICHERO`
  : muestra toda la configuración del cortafuegos
- sudo cp ficheronftables.conf /etc/nftables.conf
  : poner la configuración nueva primero
- tablas
  : [comandos tablas](#tablas)
- nft flush ruleset
  : borrar todas las tablas
- nft flush chain ip `NOMBRE_TABLA` `NOMBRE_CADENA`
  : borrar la cadena
- crear reglas
  : [reglas](#gestión-de-reglas)

## Instalación de cortafuegos. Ubicación.

- sudo apt-get remove iptables
- sudo apt-get install nftables

> El comando nft debe ejecutarse SIEMPRE como administrador, con sudo

### Hooks

- Prerouting
  : aún no ha entrado
- Input
  : para nosotros pero aún no ha entrado
- Output
  : el paquete sale pero no se sabe que hacer con el
- Postrouting
  : sale y ya ha cruzado la tabla de enrutamiento
- Forwarding
  : cruzan pero no son para nosotros

### Tablas

> Indica el protocolo que queremos analizar( ip, ip6, arp, bridge)

- nft list tables
  : examinar qué hemos hecho con los distintos protocolos
- sudo nft add table ip `NOMBRE`
  : crear una tabla
- sudo nft delete table ip `NOMBRE`
  : borrar una tabla

Es decir la pauta es sudo nft ( _add_ / _remove_ ) table `familia` `NombreDeLaTabla`.

[Más gestión de tablas](#gestión-de-tablas)

### Cadena

> Reglas que nft irá examinando por orden para decidir qué hacer con un paquete.

- base
  : ve todo el tráfico TCP
- no base
  : al principio no ve nada

Hay que indicar:

- Tipo de manipulación
  : _filter_/_route_/_nat_
- Etapa o hook
- Prioridad
- Política
  : **_accept_**/drop

### Regla

> Dentro de una cadena

- Identificador o código de regla
- Posición
- Match
  : para crear _condiciones_ con una sentencia para decir que se hace en ese caso

## Gestión de tablas

- nft add table ip `NOMBRE`
  : tabla que trabaja con ipv4
- nft add table inet `NOMBRE`
  : tabla con ip (_ipv4_/_ipv6_)
- nft list tables
  : ver las tablas
  Borrar una tabla:
- sudo nft delete table (_ip_/_inet_) `NOMBRE`
  : borrar una tabla

## Gestión de cadenas

Examinar el tráfico cuyo destino sera algún servidor que esté instalado en el mismo ordenador del cortafuegos . Dicha cadena se llamara `traficoEntrada`:

| sudo nft    | add chain     | ip   | filtradoUsuarios | traficoEntrada      | {type filter | hook input             | priority0\;}   |
| ----------- | ------------- | ---- | ---------------- | ------------------- | ------------ | ---------------------- | -------------- |
| comando nft | añadir cadena | ipv4 | nombre tabla     | nombre de la cadena | tipo filtro  | [hook](#hooks) entrada | prioridad alta |

## Gestión de reglas

- sudo nft add rule ip `NOMBRE_TABLA` `NOMBRE_REGLA` ip saddr `192.168.47.5` drop
  : Descarta (_drop_) paquetes cuya IP de origen (_Source ADDRess_) sea `192.168.47.5`
- sudo nft add rule ip `NOMBRE_TABLA` `NOMBRE_REGLA` ip daddr `10.45.10.10` drop
  : Descarta paquetes cuya IP de destino (_Destination ADDRess_) sea `10.45.10.10`
- sudo nft add rule ip `NOMBRE_TABLA` `NOMBRE_REGLA` ip daddr `10.45.10.0/24` drop
  : Descarta paquetes cuya IP de destino sea del tipo `10.45.10.xxx`
- sudo nft add rule ip `NOMBRE_TABLA` `NOMBRE_REGLA` ip saddr `192.168.47.5` daddr `10.45.10.10` drop
  : Descarta los paquetes cuya IP de origen sea `192.168.47.5` y vayan destinados a la IP `10.45.10.10`.
- sudo nft add rule ip `NOMBRE_TABLA` `NOMBRE_REGLA` tcp dport `80` drop
  : Descarta TODO EL TRÁFICO cuyo puerto de destino sea el `80`
- sudo nft add rule ip `NOMBRE_TABLA` `NOMBRE_REGLA` tcp dport 80 drop ip saddr `192.168.47.5` tcp dport `443`
  : Descarta todo el tráfico cuyo IP de origen sea `192.168.47.5` y cuyo puerto de destino sea el `443`
- sudo nft add rule ip `NOMBRE_TABLA` `NOMBRE_REGLA` tcp dport 80 drop ip saddr `192.168.1.0/24` tcp dport `1-1024`
  : Descarta todo el tráfico cuyo IP de origen sea `192.168.1.xxx` y cuyo puerto de destino esté entre `1 y 1024`
- sudo nft add rule ip `NOMBRE_TABLA` `NOMBRE_REGLA` ip saddr `192.168.1.45` limit rate over `100kbytes/second` drop
  : Si se excede el límite de `100kbytes/seg` entonces el tráfico se descarta

- sudo nft add rule ip tablaNAT natEntrada tcp dport `80` dnat to `192.168.100.10:80`
  : Cuando llegue una conexión al puerto `80` de este cortafuegos redirigir la conexión hacia el puerto 80 de la IP `192.168.100.10`
- tcp sport {80,443} quota until `100 mbytes` accept
  : Poner límites o _cuotas_ para no aceptar más de `100MBytes` descargados

## Acciones sobre paquetes

- drop
  : Descartar
- counter
  : recuento de bytes/paquetes que cumplen una cierta regla
- accept
  : si una cadena utiliza por defecto drop es posible que nos interese permitir algunos paquetes

## Pruebas de funcionamiento. Sondeo.

- netcat
  : herramienta genérica de gestión de redes
- nmap
  : herramienta específica de comprobación de puertos
- log
  : ficheros de log para registrar la actividad de la red.

## Registro de sucesos de un cortafuegos

- sudo nft add rule ip tablaFiltrado cadenaEntrada log
  : Esto registra absolutamente todo el tráfico que circule por esa cadena
- sudo nft add rule ip tablaFiltrado cadenaEntrada tcp dport 80 log
  : Esto registra solo el tráfico de entrada HTTP

> Los registros del cortafuegos van al fichero /etc/syslog

## Resolución de problemas

- Lanza el comando nft siempre como superusuario
  : **sudo nft**
- Asegúrate de que pones la regla en el [hook](#hooks) correcto
- Si no puedes enrutar
  : haz `sudo nano /etc/sysctl.conf`. La línea que controla el forwarding debe ser así: `net.ipv4.forward=1`

## Como empezar

1. sudo nft flush ruleset
   : para limpiar el cortafuegos
2. sudo nft add table ip `NOMBRE_TABLA`
   : para añadir una nueva tabla
3. sudo nft list table ip `NOMBRE_TABLA`
   : para listar las cadenas de la tabla

### Cositas

- Si es tarjeta (_enp0s3_/_enp0s8_)
  : `iifname enp0s8 tcp`
- tráfico web
  : `sudo nft add chain ip filtradoWeb prohibicionEntrada {type filter hook input priority 0\; policy accept\;}`
- trafico web prohibido a todos
  : `sudo nft add chain ip filtradoWeb prohibicionEntrada {type filter hook input priority 0\; policy drop\;}`
