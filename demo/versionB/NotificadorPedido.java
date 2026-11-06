package versionB;

import comun.Pedido;

// (S) Responsabilidad unica: notificar al cliente
public class NotificadorPedido {
    public void enviarConfirmacion(Pedido pedido) {
        System.out.println("Enviando confirmacion a " + pedido.getCliente());
    }
}
