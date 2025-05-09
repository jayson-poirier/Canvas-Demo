$(document).ready(function () {
    let canvas = document.getElementById("canvas")
    let ctx = canvas.getContext("2d")
    let image_link_input = document.getElementById("imageSRC")
    let size_input = document.getElementById("size")
    let colour_input = document.getElementById("colours")
    let fill_input = document.getElementById("fill")

    let canvasx = $(canvas).offset().left
    let canvasy = $(canvas).offset().top
    let last_mousex = 0
    let last_mousey = 0
    let mousex = 0
    let mousey = 0
    let radius = 0
    let mousedown = false
    let click = false
    let shiftpressed = false

    let selected_shape = "line"
    let line_points = []
    let line_points_ = []
    let new_line = false
    let shapes = []
    let shapes_ = []
    let shape = {}


    function draw(element) {
        let fill_style = element.fill ? element.colour : "transparent"

        ctx.beginPath()
        switch (element.type) {
            case "linePoint":
            case "line":
                ctx.moveTo(element.o.x, element.o.y)
                if (element.shift) {
                    let d_x = Math.abs(element.o.x - element.p.x)
                    let d_y = Math.abs(element.o.y - element.p.y)
                    ctx.lineTo(d_x < d_y ? element.o.x : element.p.x, d_x < d_y ? element.p.y : element.o.y)
                } else {
                    ctx.lineTo(element.p.x, element.p.y)
                }
                ctx.lineTo(element.o.x, element.o.y)
                break
            case "circle":
                radius = Math.sqrt(
                    Math.pow(element.p.x - element.o.x, 2) + Math.pow(element.p.y - element.o.y, 2),
                )
                ctx.arc(element.o.x, element.o.y, radius, 0, 2 * Math.PI)
                break
            case "rectangle":
                ctx.rect(element.o.x, element.o.y, element.p.x - element.o.x, element.p.y - element.o.y)
                break
            case "triangle":
                let triangle_coord = calculateTriangleVertexes(element)
                ctx.moveTo(triangle_coord.a.x, triangle_coord.a.y)
                ctx.lineTo(triangle_coord.b.x, triangle_coord.b.y)
                ctx.lineTo(triangle_coord.c.x, triangle_coord.c.y)
                ctx.lineTo(triangle_coord.a.x, triangle_coord.a.y)
                ctx.lineTo(triangle_coord.b.x, triangle_coord.b.y)
                break
            case "arrow":
                let arrow_coord = calculateArrow(element)
                ctx.fillStyle = element.colour
                ctx.moveTo(arrow_coord.o.x, arrow_coord.o.y)
                ctx.lineTo(arrow_coord.a.x, arrow_coord.a.y)
                ctx.lineTo(arrow_coord.b.x, arrow_coord.b.y)
                ctx.lineTo(arrow_coord.c.x, arrow_coord.c.y)
                ctx.lineTo(arrow_coord.d.x, arrow_coord.d.y)
                ctx.lineTo(arrow_coord.e.x, arrow_coord.e.y)
                ctx.lineTo(arrow_coord.f.x, arrow_coord.f.y)
                ctx.lineTo(arrow_coord.o.x, arrow_coord.o.y)
                ctx.fill()
                ctx.moveTo(arrow_coord.a.x, arrow_coord.a.y)
                ctx.lineTo(arrow_coord.o.x, arrow_coord.o.y)
                ctx.lineTo(arrow_coord.f.x, arrow_coord.f.y)
                break
            default:
        }
        ctx.fillStyle = fill_style
        ctx.strokeStyle = "black"
        ctx.lineWidth = 4 * element.size
        ctx.fill()
        ctx.stroke()
    }

    function degreeToRad(angle) {
        return angle * Math.PI / 180
    }

    function cos(angle) {
        return Math.cos(degreeToRad(angle))
    }

    function sin(angle) {
        return Math.sin(degreeToRad(angle))
    }

    function calculateVector(o, p) {
        return {
            x: p.x - o.x,
            y: p.y - o.y,
        }
    }

    function rotateVector(v, angle) {
        return {
            x: v.x * cos(angle) - v.y * sin(angle),
            y: v.x * sin(angle) + v.y * cos(angle),
        }
    }

    function calculateUnitaryVector(v) {
        let norm = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2))
        return {
            x: v.x / norm,
            y: v.y / norm,
        }
    }

    function calculateLengthedVector(u_v, length) {
        return {
            x: u_v.x * length,
            y: u_v.y * length,
        }
    }

    function calculateNewPoint(o, v_op) {
        return {
            x: o.x + v_op.x,
            y: o.y + v_op.y,
        }
    }

    function calculateTriangleVertexes(element) {
        let v_oa = calculateVector(element.o, element.p)
        let v_ab = rotateVector(v_oa, 120)
        let v_ac = rotateVector(v_oa, -120)

        return {
            a: {
                x: element.p.x,
                y: element.p.y,
            },
            b: calculateNewPoint(element.o, v_ab),
            c: calculateNewPoint(element.o, v_ac),
        }
    }

    function calculateArrow(element) {
        let length = element.size * 60

        let u_op = calculateUnitaryVector(calculateVector(element.p, element.o))

        let v_oa_of = calculateLengthedVector(u_op, Math.SQRT2 * length / 3)

        let a = calculateNewPoint(element.o, rotateVector(v_oa_of, 45))
        let f = calculateNewPoint(element.o, rotateVector(v_oa_of, -45))

        let v_ab_fe = calculateLengthedVector(u_op, length / 4)

        let b = calculateNewPoint(a, rotateVector(v_ab_fe, -90))
        let e = calculateNewPoint(f, rotateVector(v_ab_fe, 90))

        let v_bc_ed = calculateLengthedVector(u_op, length * 2 / 3)

        let c = calculateNewPoint(b, v_bc_ed)
        let d = calculateNewPoint(e, v_bc_ed)

        return {
            o: element.o,
            a: a,
            b: b,
            c: c,
            d: d,
            e: e,
            f: f,
        }
    }

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        shapes.forEach(function (old_shape) {
            draw(old_shape)
        })
    }

    $("#image").on("click", function (e) {
        canvas.style.backgroundImage = "url(" + image_link_input.value + ")"
        redraw()
    })

    $("#line").on("click", function (e) {
        selected_shape = "line"
        new_line = true
    })

    $("#circle").on("click", function (e) {
        selected_shape = "circle"
    })

    $("#rectangle").on("click", function (e) {
        selected_shape = "rectangle"
    })

    $("#triangle").on("click", function (e) {
        selected_shape = "triangle"
    })

    $("#arrow").on("click", function (e) {
        selected_shape = "arrow"
    })

    function undo() {
        if (shapes.length > 0 && shapes[shapes.length - 1].type == "linePoint") {
            line_points.pop()
            if (line_points[line_points.length - 1].new_line) {
                line_points.pop()
            }
        }
        shapes.pop()
        redraw()
    }

    $("#undo").on("click", function (e) {
        undo()
    })

    function redo() {
        if (shapes_.length > shapes.length) {
            shapes.push(shapes_[shapes.length])
            if (shapes_[shapes.length - 1].type == "linePoint") {
                line_points.push(line_points_[line_points.length])
                if (line_points[line_points.length - 1].new_line) {
                    line_points.push(line_points_[line_points.length])
                }
            }
        }
        redraw()
    }

    $("#redo").on("click", function (e) {
        redo()
    })

    $("#clear").on("click", function (e) {
        if (window.confirm("The canvas will be wiped. This process is irreversible.")) {
            shapes = []
            line_points = []
            redraw()
        }
    })

    $(document).on("keydown", function (e) {
        shiftpressed = e.shiftKey
        if (e.ctrlKey && e.key == "z") {
            undo()
        } else if (e.ctrlKey && e.key == "y") {
            redo()
        }
    })

    $(document).on("keyup", function (e) {
        shiftpressed = false
    })

    $(canvas).on("mousedown", function (e) {
        click = true
        if (canvas.style.backgroundImage == "") {
            alert("Add an image first")
            mousedown = false
        } else {
            last_mousex = parseInt(e.clientX - canvasx)
            last_mousey = parseInt(e.clientY - canvasy)
            mousedown = true
        }
    })

    $(canvas).on("click", function (e) {
        if (selected_shape == "line" && click) {
            mousex = parseInt(e.clientX - canvasx)
            mousey = parseInt(e.clientY - canvasy)

            if (shiftpressed && (line_points.length >= 1 || new_line)) {
                let d_x = Math.abs(line_points[line_points.length - 1].x - mousex)
                let d_y = Math.abs(line_points[line_points.length - 1].y - mousey)
                line_points.push({ x: d_x < d_y ? line_points[line_points.length - 1].x : mousex, y: d_x < d_y ? mousey : line_points[line_points.length - 1].y, new_line: new_line })
            } else {
                line_points.push({ x: mousex, y: mousey, new_line: new_line })
            }
            line_points_ = line_points.slice()
            if (line_points.length > 1 && !new_line) {
                shape = {
                    type: "linePoint",
                    o: {
                        x: line_points[line_points.length - 2].x,
                        y: line_points[line_points.length - 2].y,
                    },
                    p: {
                        x: line_points[line_points.length - 1].x,
                        y: line_points[line_points.length - 1].y,
                    },
                    size: size_input.value,
                    colour: colour_input.value,
                    shift: shiftpressed,
                }
                draw(shape)
                shapes.push(shape)
                shapes_ = shapes.slice()
            } else {
                new_line = false
            }
        }
    })

    $(canvas).on("mouseup", function (e) {
        if (!click) {
            shapes.push(shape)
            shapes_ = shapes.slice()
        }
        mousedown = false
    })

    $(canvas).on("mousemove", function (e) {
        mousex = parseInt(e.clientX - canvasx)
        mousey = parseInt(e.clientY - canvasy)
        if (mousedown) {
            click = false
            redraw()
            shape = {
                type: selected_shape,
                o: {
                    x: last_mousex,
                    y: last_mousey,
                },
                p: {
                    x: mousex,
                    y: mousey,
                },
                size: size_input.value,
                colour: colour_input.value,
                fill: fill_input.checked,
                shift: shiftpressed,
            }
            draw(shape)
        }
    })
})