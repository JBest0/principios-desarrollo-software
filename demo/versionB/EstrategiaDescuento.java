package versionB;

// (D) La logica de alto nivel depende de esta abstraccion
public interface EstrategiaDescuento {
    double aplicar(double total);
}
