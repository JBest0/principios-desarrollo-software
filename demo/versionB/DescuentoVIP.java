package versionB;

// (O) Cada regla de descuento es una clase nueva
public class DescuentoVIP implements EstrategiaDescuento {
    public double aplicar(double total) { return total * 0.9; }
}
