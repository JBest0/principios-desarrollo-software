package versionB;

import comun.Pedido;

// (S) Responsabilidad unica: persistir el pedido
public class RepositorioPedidos {
    public void guardar(Pedido pedido) {
        System.out.println("Guardando pedido " + pedido.getId());
    }
}
