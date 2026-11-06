package versionB;

import comun.Item;
import comun.Pedido;

public class Main {
    public static void main(String[] args) {
        Pedido pedido = new Pedido("P-001", "cliente@correo.com", "VIP");
        pedido.agregarItem(new Item("Teclado mecanico", 45000, 2));
        pedido.agregarItem(new Item("Mouse inalambrico", 18000, 1));

        GestorPedidos gestor = new GestorPedidos(
            new CalculadoraPedido(),
            new RepositorioPedidos(),
            new NotificadorPedido()
        );

        gestor.procesarPedido(pedido, new DescuentoVIP());
        System.out.println("Total final: " + pedido.getTotal());
    }
}
