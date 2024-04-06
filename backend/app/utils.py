from typing import Optional, Type, Any, Tuple
from copy import deepcopy

from pydantic import BaseModel, create_model
from pydantic.fields import FieldInfo


# Solution taken from https://stackoverflow.com/a/76560886
def partial_model(model: Type[BaseModel]):
    def make_field_optional(
        field: FieldInfo, default: Any = None
    ) -> Tuple[Any, FieldInfo]:
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
            for field_name, field_info in model.__fields__.items()
        },
    )


def is_float(num):
    try:
        float(num.replace(",", "."))
        return True
    except ValueError:
        return False
