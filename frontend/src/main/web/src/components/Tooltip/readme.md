## Default

    const tooltip = (
      <Tooltip><strong>Holy guacamole!</strong> Check this info.</Tooltip>
    );
    <OverlayTrigger overlay={tooltip}>
      <Button>Hover for tooltip</Button>
    </OverlayTrigger>

## Inverse

    const tooltip = (
      <Tooltip inverse><strong>Holy guacamole!</strong> Check this info.</Tooltip>
    );
    <OverlayTrigger overlay={tooltip}>
      <Button>Hover for inverted tooltip</Button>
    </OverlayTrigger>

## Placement

    const tooltip = (
      <Tooltip placement='right'><strong>Holy guacamole!</strong> Check this info.</Tooltip>
    );
    <OverlayTrigger overlay={tooltip}>
      <Button>Hover for right positioned tooltip</Button>
    </OverlayTrigger>

## Alignment

    const tooltip = (
      <Tooltip alignment='left' title='Aligned Left'>
        <strong>Holy guacamole!</strong> Check this info.
      </Tooltip>
    );
    <OverlayTrigger overlay={tooltip}>
      <Button>Hover for left aligned tooltip</Button>
    </OverlayTrigger>

## Title

    const tooltip = (
      <Tooltip title='Look at me'><strong>Holy guacamole!</strong> Check this info.</Tooltip>
    );
    <OverlayTrigger overlay={tooltip}>
      <Button>Hover for tooltip with a title</Button>
    </OverlayTrigger>

## On Focus

    const tooltip = (
      <Tooltip>
        <strong>Holy guacamole!</strong> Check this clickable info.
      </Tooltip>
    );
    <OverlayTrigger trigger='focus' overlay={tooltip}>
      <Button>Click or focus for tooltip</Button>
    </OverlayTrigger>
