(() => {
    const vector = {
        add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
        scale: (value, amount) => [value[0] * amount, value[1] * amount, value[2] * amount],
        dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
        cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
        normalize: value => {
            const length = Math.hypot(value[0], value[1], value[2]) || 1;
            return [value[0] / length, value[1] / length, value[2] / length];
        }
    };

    const quaternion = {
        normalize: value => {
            const length = Math.hypot(value[0], value[1], value[2], value[3]) || 1;
            return value.map(component => component / length);
        },
        multiply: (a, b) => [
            a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
            a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
            a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
            a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
        ],
        fromAxisAngle: (axis, angle) => {
            const normalized = vector.normalize(axis);
            const half = angle / 2;
            const sine = Math.sin(half);
            return [normalized[0] * sine, normalized[1] * sine, normalized[2] * sine, Math.cos(half)];
        },
        fromEuler: (x, y, z) => {
            const qx = quaternion.fromAxisAngle([1, 0, 0], x);
            const qy = quaternion.fromAxisAngle([0, 1, 0], y);
            const qz = quaternion.fromAxisAngle([0, 0, 1], z);
            return quaternion.normalize(quaternion.multiply(qz, quaternion.multiply(qy, qx)));
        },
        fromUnitVectors: (from, to) => {
            const a = vector.normalize(from);
            const b = vector.normalize(to);
            let scalar = vector.dot(a, b) + 1;
            let xyz;
            if (scalar < 1e-6) {
                scalar = 0;
                xyz = Math.abs(a[0]) > Math.abs(a[2]) ? [-a[1], a[0], 0] : [0, -a[2], a[1]];
            } else xyz = vector.cross(a, b);
            return quaternion.normalize([xyz[0], xyz[1], xyz[2], scalar]);
        },
        slerp: (from, to, amount) => {
            let target = to;
            let cosine = from[0] * to[0] + from[1] * to[1] + from[2] * to[2] + from[3] * to[3];
            if (cosine < 0) {
                cosine = -cosine;
                target = to.map(value => -value);
            }
            if (cosine > .9995) return quaternion.normalize(from.map((value, index) => value + amount * (target[index] - value)));
            const angle = Math.acos(Math.max(-1, Math.min(1, cosine)));
            const sine = Math.sin(angle);
            const left = Math.sin((1 - amount) * angle) / sine;
            const right = Math.sin(amount * angle) / sine;
            return from.map((value, index) => value * left + target[index] * right);
        },
        rotateVector: (rotation, point) => {
            const [x, y, z, w] = rotation;
            const uv = vector.cross([x, y, z], point);
            const uuv = vector.cross([x, y, z], uv);
            return vector.add(point, vector.add(vector.scale(uv, 2 * w), vector.scale(uuv, 2)));
        }
    };

    const orientFaces = (vertices, faceIndices) => faceIndices.map((indices, index) => {
        const center = indices.reduce((sum, vertexIndex) => vector.add(sum, vertices[vertexIndex]), [0, 0, 0]);
        const normal = vector.normalize(center);
        return { indices, value: index + 1, normal, center: vector.scale(center, 1 / indices.length) };
    });

    const normalizeVertices = vertices => {
        const radius = Math.max(...vertices.map(point => Math.hypot(...point))) || 1;
        return vertices.map(point => point.map(component => component / radius));
    };

    const icosahedron = () => {
        const phi = (1 + Math.sqrt(5)) / 2;
        const vertices = normalizeVertices([
            [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
            [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
            [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
        ]);
        const faces = [
            [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
            [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
            [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
            [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
        ];
        return { vertices, faceIndices: faces };
    };

    const dualGeometry = base => {
        const vertices = base.faceIndices.map(indices => vector.normalize(indices.reduce((sum, index) => vector.add(sum, base.vertices[index]), [0,0,0])));
        const faceIndices = base.vertices.map((vertexPoint, vertexIndex) => {
            const incident = base.faceIndices.map((indices, faceIndex) => indices.includes(vertexIndex) ? faceIndex : -1).filter(index => index >= 0);
            const normal = vector.normalize(vertexPoint);
            const reference = vector.normalize(Math.abs(normal[2]) < .9 ? vector.cross([0,0,1], normal) : vector.cross([0,1,0], normal));
            const tangent = vector.cross(normal, reference);
            return incident.sort((left, right) => {
                const leftPoint = vertices[left];
                const rightPoint = vertices[right];
                return Math.atan2(vector.dot(leftPoint, tangent), vector.dot(leftPoint, reference))
                    - Math.atan2(vector.dot(rightPoint, tangent), vector.dot(rightPoint, reference));
            });
        });
        return { vertices: normalizeVertices(vertices), faceIndices };
    };

    const createGeometry = sides => {
        let vertices;
        let faceIndices;
        if (sides === 4) {
            vertices = normalizeVertices([[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]]);
            faceIndices = [[0,1,2],[0,3,1],[0,2,3],[1,3,2]];
        } else if (sides === 6) {
            vertices = normalizeVertices([[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]);
            faceIndices = [[4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[7,6,2,3],[0,1,5,4]];
        } else if (sides === 8) {
            vertices = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
            faceIndices = [[4,0,2],[4,2,1],[4,1,3],[4,3,0],[5,2,0],[5,1,2],[5,3,1],[5,0,3]];
        } else if (sides === 10) {
            const ringSize = 5;
            vertices = normalizeVertices([
                [0,0,1.2],
                [0,0,-1.2],
                ...Array.from({ length: ringSize }, (_, index) => {
                    const angle = -Math.PI / 2 + index * Math.PI * 2 / ringSize;
                    return [Math.cos(angle),Math.sin(angle),0];
                })
            ]);
            faceIndices = [];
            for (let index = 0; index < ringSize; index += 1) {
                const current = 2 + index;
                const next = 2 + ((index + 1) % ringSize);
                faceIndices.push([0,current,next]);
            }
            for (let index = 0; index < ringSize; index += 1) {
                const current = 2 + index;
                const next = 2 + ((index + 1) % ringSize);
                faceIndices.push([1,next,current]);
            }
        } else if (sides === 12) {
            const dual = dualGeometry(icosahedron());
            vertices = dual.vertices;
            faceIndices = dual.faceIndices;
        } else if (sides === 20) {
            const geometry = icosahedron();
            vertices = geometry.vertices;
            faceIndices = geometry.faceIndices;
        } else throw new Error(`Geometría no disponible para d${sides}.`);
        return { sides, vertices, faces: orientFaces(vertices, faceIndices) };
    };

    const geometryCache = new Map();
    const getGeometry = sides => {
        if (!geometryCache.has(sides)) geometryCache.set(sides, createGeometry(sides));
        return geometryCache.get(sides);
    };
    const easeInOut = value => .5 - Math.cos(Math.PI * value) / 2;
    const easeOut = value => 1 - Math.pow(1 - value, 3);
    const spinQuaternion = (seed, amount) => quaternion.fromEuler(
        seed * .37 + Math.PI * (5.2 + seed % 2.7) * easeInOut(amount),
        seed * .61 + Math.PI * (7.1 + seed % 3.1) * easeInOut(amount),
        seed * .23 + Math.PI * (4.4 + seed % 2.2) * easeInOut(amount)
    );

    const alignD10FaceVertically = (geometry, face, aligned) => {
        const poleIndex = face.value <= 5 ? 0 : 1;
        const pole = quaternion.rotateVector(aligned, geometry.vertices[poleIndex]);
        const edgePoints = face.indices.filter(index => index !== poleIndex).map(index => quaternion.rotateVector(aligned, geometry.vertices[index]));
        const edgeCenter = vector.scale(vector.add(edgePoints[0], edgePoints[1]), .5);
        const poleDirection = Math.atan2(pole[1] - edgeCenter[1], pole[0] - edgeCenter[0]);
        const desiredDirection = face.value <= 5 ? Math.PI / 2 : -Math.PI / 2;
        const verticalTurn = desiredDirection - poleDirection;
        return quaternion.normalize(quaternion.multiply(quaternion.fromAxisAngle([0,0,1], verticalTurn), aligned));
    };

    const getTargetQuaternion = (geometry, result) => {
        const face = geometry.faces.find(item => item.value === Number(result)) || geometry.faces[0];
        const aligned = quaternion.fromUnitVectors(face.normal, [0,0,1]);
        if (geometry.sides === 8) return quaternion.normalize(quaternion.multiply(quaternion.fromEuler(-.24, .18, 0), aligned));
        if (geometry.sides === 10) return alignD10FaceVertically(geometry, face, aligned);
        return aligned;
    };
    const getAnimatedQuaternion = (geometry, result, progress, seed = 1) => {
        const clamped = Math.max(0, Math.min(1, progress));
        const settleStart = .68;
        if (clamped < settleStart) return spinQuaternion(seed, clamped / settleStart);
        const settle = easeOut((clamped - settleStart) / (1 - settleStart));
        const base = quaternion.slerp(spinQuaternion(seed, 1), getTargetQuaternion(geometry, result), settle);
        const remaining = 1 - settle;
        const wobble = quaternion.fromEuler(Math.sin(settle * Math.PI * 3) * remaining * .11, Math.sin(settle * Math.PI * 2) * remaining * .08, 0);
        return quaternion.normalize(quaternion.multiply(wobble, base));
    };
    const getFrontFaceValue = (geometry, rotation) => geometry.faces.reduce((best, face) => {
        const score = quaternion.rotateVector(rotation, face.normal)[2];
        return score > best.score ? { value: face.value, score } : best;
    }, { value: null, score: -Infinity }).value;

    const palette = Object.freeze({
        4: [168,85,247], 6: [14,165,233], 8: [20,184,166], 10: [99,102,241], 12: [217,70,239], 20: [139,92,246]
    });
    const drawExceptionalEdgeTrace = (context, geometry, faces, projected, result, tone, progress, flash) => {
        if (!tone || progress <= 0 || geometry.sides !== 20) return;
        const visibleFaces = faces.filter(face => face.transformedNormal[2] > .02);
        const edgeMap = new Map();
        visibleFaces.forEach(face => face.indices.forEach((from, index) => {
            const to = face.indices[(index + 1) % face.indices.length];
            const key = from < to ? `${from}:${to}` : `${to}:${from}`;
            if (!edgeMap.has(key)) edgeMap.set(key, { from, to });
        }));
        const remaining = [...edgeMap.values()];
        const ordered = [];
        const resultFace = geometry.faces.find(face => face.value === result);
        let cursor = resultFace?.indices?.[0] ?? remaining[0]?.from;
        const takeEdge = predicate => {
            const edgeIndex = remaining.findIndex(predicate);
            if (edgeIndex < 0) return false;
            const [edge] = remaining.splice(edgeIndex, 1);
            if (edge.to === cursor) [edge.from, edge.to] = [edge.to, edge.from];
            ordered.push(edge);
            cursor = edge.to;
            return true;
        };
        if (resultFace) resultFace.indices.forEach((from, index) => {
            const to = resultFace.indices[(index + 1) % resultFace.indices.length];
            takeEdge(edge => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from));
        });
        while (remaining.length) {
            if (!takeEdge(edge => edge.from === cursor || edge.to === cursor)) {
                const nearest = remaining.reduce((best, edge, index) => {
                    const cursorPoint = projected[cursor];
                    const fromPoint = projected[edge.from];
                    const toPoint = projected[edge.to];
                    const fromDistance = Math.hypot(fromPoint.x - cursorPoint.x, fromPoint.y - cursorPoint.y);
                    const toDistance = Math.hypot(toPoint.x - cursorPoint.x, toPoint.y - cursorPoint.y);
                    const distance = Math.min(fromDistance, toDistance);
                    return distance < best.distance ? { index, reverse: toDistance < fromDistance, distance } : best;
                }, { index: 0, reverse: false, distance: Infinity });
                const [edge] = remaining.splice(nearest.index, 1);
                if (nearest.reverse) [edge.from, edge.to] = [edge.to, edge.from];
                ordered.push(edge);
                cursor = edge.to;
            }
        }

        const tracedEdges = progress * ordered.length;
        const width = context.canvas.width;
        const bright = tone.kind === 'critical' ? [255, 251, 235] : [255, 228, 230];
        context.save();
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.globalCompositeOperation = 'screen';
        ordered.forEach((edge, index) => {
            const portion = Math.max(0, Math.min(1, tracedEdges - index));
            if (!portion) return;
            const from = projected[edge.from];
            const to = projected[edge.to];
            context.beginPath();
            context.moveTo(from.x, from.y);
            context.lineTo(from.x + (to.x - from.x) * portion, from.y + (to.y - from.y) * portion);
            context.lineWidth = Math.max(1.6, width * (.008 + flash * .006));
            context.strokeStyle = `rgba(${tone.rgb.join(',')},${.46 + progress * .3 + flash * .2})`;
            context.shadowColor = `rgba(${tone.rgb.join(',')},${.58 + flash * .34})`;
            context.shadowBlur = width * (.016 + flash * .045);
            context.stroke();
        });
        if (flash > 0) {
            ordered.forEach(edge => {
                const from = projected[edge.from];
                const to = projected[edge.to];
                context.beginPath();
                context.moveTo(from.x, from.y);
                context.lineTo(to.x, to.y);
                context.lineWidth = Math.max(1, width * .0045);
                context.strokeStyle = `rgba(${bright.join(',')},${flash * .9})`;
                context.shadowColor = `rgba(${tone.rgb.join(',')},${flash})`;
                context.shadowBlur = width * .065;
                context.stroke();
            });
            const face = visibleFaces.find(item => item.value === result);
            if (face) {
                const points = face.indices.map(index => projected[index]);
                const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
                const y = points.reduce((sum, point) => sum + point.y, 0) / points.length;
                const radius = width * .32;
                const glow = context.createRadialGradient(x, y, 0, x, y, radius);
                glow.addColorStop(0, `rgba(${bright.join(',')},${flash * .32})`);
                glow.addColorStop(.42, `rgba(${tone.rgb.join(',')},${flash * .16})`);
                glow.addColorStop(1, `rgba(${tone.rgb.join(',')},0)`);
                context.fillStyle = glow;
                context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            }
        }
        context.restore();
    };
    const drawDie = (context, geometry, rotation, options = {}) => {
        const width = context.canvas.width;
        const height = context.canvas.height;
        context.clearRect(0, 0, width, height);
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) * .42;
        const distance = 3.4;
        const orthographicBlend = Math.max(0, Math.min(1, Number(options.orthographicBlend) || 0));
        const transformedVertices = geometry.vertices.map(point => quaternion.rotateVector(rotation, point));
        const projected = transformedVertices.map(point => {
            const perspectiveDepth = distance / (distance - point[2]);
            const perspective = perspectiveDepth + (1 - perspectiveDepth) * orthographicBlend;
            return { x: centerX + point[0] * scale * perspective, y: centerY - point[1] * scale * perspective, z: point[2], perspective };
        });
        const faces = geometry.faces.map(face => {
            const normal = quaternion.rotateVector(rotation, face.normal);
            const center = quaternion.rotateVector(rotation, face.center);
            return { ...face, transformedNormal: normal, transformedCenter: center, depth: face.indices.reduce((sum,index) => sum + transformedVertices[index][2],0) / face.indices.length };
        }).filter(face => face.transformedNormal[2] > -.08).sort((left,right) => left.depth - right.depth);
        const customPalette = Array.isArray(options.palette) && options.palette.length === 3
            ? options.palette.map(value => Math.max(0, Math.min(255, Math.round(Number(value) || 0))))
            : null;
        const rgb = customPalette || palette[geometry.sides] || palette[20];
        const result = Number(options.result);
        const resultReveal = Math.max(0, Math.min(1, Number(options.resultReveal ?? 1)));
        const resultTone = options.resultTone === 'critical' ? [250, 204, 21] : options.resultTone === 'fumble' ? [225, 29, 72] : null;
        const resultNeighborhoodFade = Math.max(0, Math.min(1, Number(options.resultNeighborhoodFade) || 0));
        const resultFace = geometry.faces.find(face => face.value === result);
        const resultNeighborhood = resultNeighborhoodFade > 0 && resultFace
            ? new Set(geometry.faces
                .filter(face => face.value === result || face.indices.filter(index => resultFace.indices.includes(index)).length >= 2)
                .map(face => face.value))
            : null;
        faces.forEach(face => {
            const light = Math.max(.12, face.transformedNormal[2]);
            const isResult = options.settled && face.value === result;
            context.beginPath();
            face.indices.forEach((vertexIndex, index) => {
                const point = projected[vertexIndex];
                if (index) context.lineTo(point.x, point.y); else context.moveTo(point.x, point.y);
            });
            context.closePath();
            const alpha = .34 + light * .48;
            const toneBlend = resultTone ? resultReveal * .18 : 0;
            const resultRgb = resultTone ? rgb.map((value, index) => Math.round(value * (1 - toneBlend) + resultTone[index] * toneBlend)) : rgb;
            context.fillStyle = isResult ? `rgba(${resultRgb.join(',')},${resultTone ? .72 + resultReveal * .08 : '.94'})` : `rgba(${Math.round(rgb[0] * (.48 + light * .28))},${Math.round(rgb[1] * (.48 + light * .28))},${Math.round(rgb[2] * (.48 + light * .28))},${alpha})`;
            context.fill();
            context.lineWidth = isResult ? Math.max(2, width * .012) : Math.max(1, width * .006);
            context.strokeStyle = isResult && resultTone ? `rgba(${resultTone.join(',')},${.28 + resultReveal * .3})` : isResult ? 'rgba(207,250,254,.95)' : `rgba(226,232,240,${.18 + light * .32})`;
            context.stroke();
            if (face.transformedNormal[2] < .22) return;
            const neighborhoodOpacity = resultNeighborhood && !resultNeighborhood.has(face.value) ? 1 - resultNeighborhoodFade : 1;
            if (neighborhoodOpacity <= 0) return;
            const perspectiveDepth = distance / (distance - face.transformedCenter[2]);
            const perspective = perspectiveDepth + (1 - perspectiveDepth) * orthographicBlend;
            const x = centerX + face.transformedCenter[0] * scale * perspective;
            const y = centerY - face.transformedCenter[1] * scale * perspective;
            const label = options.faceLabels?.[face.value] ?? String(face.value);
            if (options.hideResultLabel && face.value === result) return;
            const reveal = face.value === result ? resultReveal : 1;
            if (reveal <= 0) return;
            const baseFontSize = Math.max(8, Math.min(width * (geometry.sides >= 12 ? .085 : .12), scale * light * .46));
            const fontSize = baseFontSize * (face.value === result ? 1.22 + reveal * .56 : 1);
            context.save();
            context.globalAlpha = Math.min(1, Math.max(0, (face.transformedNormal[2] - .15) * 1.7)) * reveal * neighborhoodOpacity;
            context.fillStyle = isResult && options.resultTone === 'critical' ? '#fffbea' : isResult && options.resultTone === 'fumble' ? '#fff1f2' : isResult ? '#ffffff' : 'rgba(248,250,252,.88)';
            context.font = `${isResult ? 800 : 700} ${fontSize}px Inter, sans-serif`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.shadowColor = 'rgba(2,6,23,.96)';
            context.shadowBlur = isResult ? fontSize * (.34 - reveal * .12) : fontSize * .18;
            if (isResult && resultTone && context.strokeText) {
                context.lineWidth = Math.max(1.4, fontSize * .1);
                context.strokeStyle = 'rgba(2,6,23,.88)';
                context.strokeText(label, x, y);
            }
            context.fillText(label, x, y);
            context.restore();
        });
        drawExceptionalEdgeTrace(context, geometry, faces, projected, result, resultTone ? { kind: options.resultTone, rgb: resultTone } : null, Math.max(0, Math.min(1, Number(options.specialTraceProgress) || 0)), Math.max(0, Math.min(1, Number(options.specialFlashProgress) || 0)));
        if (options.settled) {
            const glow = context.createRadialGradient(centerX, centerY, scale * .28, centerX, centerY, scale * 1.18);
            glow.addColorStop(0, `rgba(${rgb.join(',')},.08)`);
            glow.addColorStop(1, `rgba(${rgb.join(',')},0)`);
            context.fillStyle = glow;
            context.fillRect(0,0,width,height);
        }
    };

    window.DndDice3D = Object.freeze({ getGeometry, getTargetQuaternion, getAnimatedQuaternion, getFrontFaceValue, drawDie });
})();
