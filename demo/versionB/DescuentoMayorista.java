package versionB;

public class DescuentoMayorista implements EstrategiaDescuento {
    public double aplicar(double total) { return total * 0.85; }
}
