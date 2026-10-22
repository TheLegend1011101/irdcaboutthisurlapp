# shortener.py
from ..config import CONSTANT

constant_inverse = pow(CONSTANT, -1, 2**64)

ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"


def bijective_function(n: int) -> int:
    return (n * CONSTANT) % 2**64


def inverse_bijection(m: int) -> int:
    return (m * constant_inverse) % 2**64


def base62_encode(number: int) -> str:
    if number == 0:
        return ALPHABET[0]
    result = []
    while number > 0:
        number, rem = divmod(number, 62)
        result.append(ALPHABET[rem])
    return "".join(reversed(result))


def generate_short_code(n: int) -> str:
    return base62_encode(bijective_function(n))