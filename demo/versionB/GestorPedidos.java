package versionB;

import comun.Pedido;

// Orquesta las tres responsabilidades sin implementarlas
public class GestorPedidos {
    private final CalculadoraPedido calculadora;
    private final RepositorioPedidos repositorio;
    private final NotificadorPedido notificador;

    public GestorPedidos(CalculadoraPedido calculadora,
                         RepositorioPedidos repositorio,
                         NotificadorPedido notificador) {
        this.calculadora = calculadora;
        this.repositorio = repositorio;
        this.notificador = notificador;
    }

    public void procesarPedido(Pedido pedido, EstrategiaDescuento descuento) {
        double total = calculadora.calcularTotal(pedido, descuento);
        pedido.setTotal(total);
        repositorio.guardar(pedido);
        notificador.enviarConfirmacion(pedido);
    }
}
