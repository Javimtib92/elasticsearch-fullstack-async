from typing import Optional, Type, Any, Tuple
from copy import deepcopy

from pydantic import BaseModel, create_model
from pydantic.fields import FieldInfo


def partial_model(model: Type[BaseModel]):
    """
    Create a partial Pydantic model where all fields are optional.

    Args:
        model (Type[BaseModel]): The Pydantic model to create a partial version of.

    Returns:
        Type[BaseModel]: The partial Pydantic model.
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
