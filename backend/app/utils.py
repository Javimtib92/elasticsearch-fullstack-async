from copy import deepcopy
from typing import Any, Optional, Tuple, Type

from pydantic import BaseModel, create_model
from pydantic.fields import FieldInfo


def partial_model(model: Type[BaseModel]):
    """
    Create a partial Pydantic model where all fields are optional.

    Usage:

    ```python
    @partial_model
    class PoliticianUpdate(Politician):
        pass
    ```

    Args:
        model (Type[BaseModel]): The Pydantic model to create a partial version of.

    Returns:
        Type[BaseModel]: The partial Pydantic model.

    Reference:
        https://github.com/pydantic/pydantic/issues/3120#issuecomment-1528030416
    """

    def make_field_optional(
        field: FieldInfo, default: Any = None
    ) -> Tuple[Any, FieldInfo]:
        """
        Make a Pydantic model field optional.

        Args:
            field (FieldInfo): The field to make optional.
            default (Any, optional): The default value for the optional field. Defaults to None.

        Returns:
            Tuple[Any, FieldInfo]: A tuple containing the optional field type and its information.
        """
        new = deepcopy(field)
        new.default = default
        new.annotation = Optional[field.annotation]  # type: ignore
        return new.annotation, new

    return create_model(
        f"Partial{model.__name__}",
        __base__=model,
        __module__=model.__module__,
        **{
            field_name: make_field_optional(field_info)
            for field_name, field_info in model.model_fields.items()
        },
    )


def is_float(num):
    """
    Check if a string can be converted to a float.

    Usage:

    ```python
    is_float("0.3") # true
    is_float("0,3") # true
    is_float("s0.3") # false
    ```
    Args:
        num (str): The string to check.

    Returns:
        bool: True if the string can be converted to a float, False otherwise.
    """
    try:
        float(num.replace(",", "."))
        return True
    except ValueError:
        return False
